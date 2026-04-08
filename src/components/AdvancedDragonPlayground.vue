<template>
  <div class="advanced-dragon-playground">
    <h2>高级龙形文本 Playground</h2>

    <AdvancedDragonControls
      v-model:dragon-text-content="dragonTextContent"
      v-model:dragon-speed="dragonSpeed"
      v-model:base-swing-amplitude="baseSwingAmplitude"
      v-model:repulsion-force="repulsionForce"
      v-model:recovery-speed="recoverySpeed"
      v-model:show-dragon-wings="showDragonWings"
      v-model:show-dragon-limbs="showDragonLimbs"
      v-model:show-dragon-horns="showDragonHorns"
      v-model:wing-decoration-text="wingDecorationText"
      v-model:limb-decoration-text="limbDecorationText"
      v-model:horn-decoration-text="hornDecorationText"
      v-model:wing-open-angle="wingOpenAngle"
      v-model:limb-open-angle="limbOpenAngle"
      v-model:horn-open-angle="hornOpenAngle"
      v-model:wing-decoration-size="wingDecorationSize"
      v-model:limb-decoration-size="limbDecorationSize"
      v-model:horn-decoration-size="hornDecorationSize"
      v-model:wing-decoration-spacing="wingDecorationSpacing"
      v-model:limb-decoration-spacing="limbDecorationSpacing"
      v-model:horn-decoration-spacing="hornDecorationSpacing"
      v-model:wing-flap-amplitude="wingFlapAmplitude"
      v-model:wing-flap-speed="wingFlapSpeed"
      v-model:ornament-sway-amplitude="ornamentSwayAmplitude"
      v-model:ornament-sway-speed="ornamentSwaySpeed"
      v-model:custom-text="customText"
    />

    <div
      ref="container"
      class="container"
      @mousemove="handleMouseMove"
    >
      <div class="text-container">
        <div
          v-for="(line, lineIndex) in displayTexts"
          :key="lineIndex"
          class="text-line"
        >
          <span
            v-for="(char, charIndex) in line"
            :key="`${lineIndex}-${charIndex}`"
            :ref="(el) => setTextCharRef(lineIndex, charIndex, el)"
            class="text-char"
          >
            {{ char }}
          </span>
        </div>
      </div>

      <div
        v-for="decoration in dragonDecorations"
        :key="decoration.id"
        class="dragon-decoration"
        :class="[
          `dragon-decoration--${decoration.kind}`,
          `dragon-decoration--${decoration.side}`
        ]"
        :style="{
          left: `${decoration.x}px`,
          top: `${decoration.y}px`,
          width: `${decoration.width}px`,
          height: `${decoration.height}px`,
          fontSize: `${decoration.fontSize}px`,
          color: decoration.color,
          zIndex: decoration.zIndex,
          opacity: decoration.opacity,
          transform: `translate(-50%, -50%) rotate(${decoration.rotation}rad) scale(${decoration.scaleX}, ${decoration.scaleY})`
        }"
      >
        {{ decoration.text }}
      </div>

      <div
        v-for="(segment, index) in dragonSegments"
        :key="index"
        class="dragon-segment"
        :style="{
          left: `${segment.x}px`,
          top: `${segment.y}px`,
          transform: `translate(-50%, -50%) rotate(${segment.angle}rad)`
        }"
      >
        {{ segment.char }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import AdvancedDragonControls from './advanced-dragon-playground/AdvancedDragonControls.vue';
import { useDragonDecorations } from './advanced-dragon-playground/useDragonDecorations';
import type { Point, DragonSegment, TextCharState } from './advanced-dragon-playground/types';

// DOM 引用：
// container 用于坐标系换算；textCharRefs 保存每个字符节点，便于逐字物理更新。
const container = ref<HTMLElement | null>(null);
const textCharRefs = ref<Record<string, HTMLElement | null>>({});
const textCharStates = ref<Record<string, TextCharState>>({});

// 龙体与装饰基础配置（可由控制面板实时调整）。
const dragonTextContent = ref('>>>这是一条很长的龙形文本============+++---');
const dragonSpeed = ref(5);
const baseSwingAmplitude = ref(0);
const currentSwingAmplitude = ref(5);

const showDragonWings = ref(true);
const showDragonLimbs = ref(true);
const showDragonHorns = ref(true);
const wingDecorationText = ref('-------');
const limbDecorationText = ref('xx');
const hornDecorationText = ref('<<');
const wingOpenAngle = ref(42);
const limbOpenAngle = ref(34);
const hornOpenAngle = ref(26);
const wingDecorationSize = ref(24);
const limbDecorationSize = ref(18);
const hornDecorationSize = ref(18);
const wingDecorationSpacing = ref(16);
const limbDecorationSpacing = ref(11);
const hornDecorationSpacing = ref(11);
const wingFlapAmplitude = ref(9);
const wingFlapSpeed = ref(5.4);
const ornamentSwayAmplitude = ref(4);
const ornamentSwaySpeed = ref(3.8);
const animationClock = ref(0);

// 运行时状态：
// - dragonSegments: 每段龙身的位置与朝向
// - headTrail: 蛇形跟随轨迹（头部历史点）
// - segmentSpeeds: 每段速度（用于碰撞力度）
const dragonSegments = ref<DragonSegment[]>([]);
const headTrail = ref<Point[]>([]);
const segmentSpeeds = ref<number[]>([]);

// 鼠标与运动方向状态：
// 鼠标只更新 targetPosition，实际头部位置会插值跟随，避免抖动。
const mousePosition = reactive({ x: 100, y: 100 });
const targetPosition = reactive({ x: 100, y: 100 });
const mouseMoving = ref(false);
const mouseStopTime = ref(0);
const dragonDirection = reactive({ x: 1, y: 0 });

const customText = ref(`这是一段会被龙形文本挤开的文本。
当龙在文本间穿行时，字符会像沙子一样贴着龙身。
你可以在这里自由编辑内容，每一行都会单独排列。
停下后文本会尽量回位，但仍会被龙身稳定支撑。`);
const displayTexts = computed(() => customText.value.split('\n'));

// 文本字符物理参数：
// 通过“速度 + 阻尼 + 回位弹性”模拟被龙身挤开后的动态。
const repulsionForce = ref(30);
const recoverySpeed = ref(0.05);
const damping = ref(0.9);
const collisionSpeedThreshold = 0.2;
const collisionRadius = 18;
const collisionHoldRadius = 20;
const staticPushStrength = 1;
const collisionSettling = 0.7;
const collisionStaticVelocityThreshold = 0.08;
const restPositionThreshold = 0.05;
const restVelocityThreshold = 0.05;
const trailPointSpacing = 4;
const segmentDistance = 20;
const mouseStopThreshold = 500;

// 装饰计算委托给 composable，主组件只消费渲染结果。
const dragonDecorations = useDragonDecorations(dragonSegments, animationClock, {
  showDragonWings,
  showDragonLimbs,
  showDragonHorns,
  wingDecorationText,
  limbDecorationText,
  hornDecorationText,
  wingOpenAngle,
  limbOpenAngle,
  hornOpenAngle,
  wingDecorationSize,
  limbDecorationSize,
  hornDecorationSize,
  wingDecorationSpacing,
  limbDecorationSpacing,
  hornDecorationSpacing,
  wingFlapAmplitude,
  wingFlapSpeed,
  ornamentSwayAmplitude,
  ornamentSwaySpeed
});

// 计算两点距离，是轨迹采样和碰撞判断的基础工具。
const getPointDistance = (from: Point, to: Point) => Math.hypot(to.x - from.x, to.y - from.y);

const getMaxTrailPoints = (segmentCount: number) => {
  const totalLength = Math.max(1, segmentCount) * segmentDistance;
  return Math.ceil(totalLength / trailPointSpacing) + 24;
};

const getMaxTrailLength = (segmentCount: number) => {
  return Math.max(1, segmentCount - 1) * segmentDistance + trailPointSpacing * 6;
};

const trimHeadTrail = () => {
  // 将轨迹长度裁剪到“足够覆盖整条龙身”的范围，
  // 防止历史点无上限增长带来的性能和内存开销。
  if (headTrail.value.length <= 1) {
    return;
  }

  const maxTrailLength = getMaxTrailLength(dragonSegments.value.length);
  const trimmedTrail: Point[] = [headTrail.value[0]];
  let traveled = 0;

  for (let index = 1; index < headTrail.value.length; index += 1) {
    const previousPoint = trimmedTrail[trimmedTrail.length - 1];
    const currentPoint = headTrail.value[index];
    const segmentLength = getPointDistance(previousPoint, currentPoint);

    if (segmentLength < 0.001) {
      continue;
    }

    if (traveled + segmentLength >= maxTrailLength) {
      const ratio = (maxTrailLength - traveled) / segmentLength;
      trimmedTrail.push({
        x: previousPoint.x + (currentPoint.x - previousPoint.x) * ratio,
        y: previousPoint.y + (currentPoint.y - previousPoint.y) * ratio
      });
      headTrail.value = trimmedTrail;
      return;
    }

    trimmedTrail.push(currentPoint);
    traveled += segmentLength;
  }

  headTrail.value = trimmedTrail;
};

const pushHeadTrailPoint = (point: Point) => {
  // 将头部新位置写入轨迹。
  // 当移动距离较大时，按固定间距插值补点，避免身体采样时出现断裂。
  if (headTrail.value.length === 0) {
    headTrail.value = [{ ...point }];
    return;
  }

  const latestPoint = headTrail.value[0];
  const distance = getPointDistance(point, latestPoint);

  if (distance < 0.001) {
    headTrail.value[0] = { ...point };
    return;
  }

  const interpolatedPoints: Point[] = [{ ...point }];
  const steps = Math.floor(distance / trailPointSpacing);

  for (let step = 1; step <= steps; step += 1) {
    const ratio = (step * trailPointSpacing) / distance;
    if (ratio >= 1) {
      break;
    }

    interpolatedPoints.push({
      x: point.x + (latestPoint.x - point.x) * ratio,
      y: point.y + (latestPoint.y - point.y) * ratio
    });
  }

  headTrail.value = [...interpolatedPoints, ...headTrail.value];
  trimHeadTrail();
};

const getTrailPointAtDistance = (distanceFromHead: number): Point => {
  // 在轨迹折线中按“累计弧长”采样点。
  // 这是“每节沿路径延迟跟随”的核心。
  if (headTrail.value.length === 0) {
    return { x: mousePosition.x, y: mousePosition.y };
  }

  if (distanceFromHead <= 0) {
    return headTrail.value[0];
  }

  let traveled = 0;

  for (let index = 1; index < headTrail.value.length; index += 1) {
    const newerPoint = headTrail.value[index - 1];
    const olderPoint = headTrail.value[index];
    const segmentLength = getPointDistance(newerPoint, olderPoint);

    if (segmentLength < 0.001) {
      continue;
    }

    if (traveled + segmentLength >= distanceFromHead) {
      const ratio = (distanceFromHead - traveled) / segmentLength;
      return {
        x: newerPoint.x + (olderPoint.x - newerPoint.x) * ratio,
        y: newerPoint.y + (olderPoint.y - newerPoint.y) * ratio
      };
    }

    traveled += segmentLength;
  }

  return headTrail.value[headTrail.value.length - 1];
};

const syncDragonSegmentsWithTrail = () => {
  // 每一帧把龙身段位同步到轨迹：
  // 1) 头部在轨迹 0 距离点
  // 2) 第 i 段在 i * segmentDistance 的采样点
  // 3) 段朝向由前后段向量计算
  if (dragonSegments.value.length === 0) {
    return;
  }

  const now = Date.now();
  const previousPositions = dragonSegments.value.map((segment) => ({ x: segment.x, y: segment.y }));
  const headPoint = getTrailPointAtDistance(0);

  dragonSegments.value[0].x = headPoint.x;
  dragonSegments.value[0].y = headPoint.y;
  dragonSegments.value[0].angle = Math.atan2(dragonDirection.y, dragonDirection.x);

  for (let index = 1; index < dragonSegments.value.length; index += 1) {
    const currentSegment = dragonSegments.value[index];
    const previousSegment = dragonSegments.value[index - 1];
    const trailPoint = getTrailPointAtDistance(index * segmentDistance);
    currentSegment.x = trailPoint.x;
    currentSegment.y = trailPoint.y;

    const dx = previousSegment.x - currentSegment.x;
    const dy = previousSegment.y - currentSegment.y;
    const distance = Math.hypot(dx, dy);
    currentSegment.angle = distance > 0.001 ? Math.atan2(dy, dx) : previousSegment.angle;
  }

  if (currentSwingAmplitude.value > 0.1) {
    // 叠加轻微横向摆动，让路径跟随不至于“过硬”。
    dragonSegments.value.forEach((segment, index) => {
      if (index === 0) {
        return;
      }

      const swingStrength = Math.sin(now * 0.005 - index * 0.65) * currentSwingAmplitude.value;
      segment.x += Math.sin(segment.angle) * swingStrength;
      segment.y -= Math.cos(segment.angle) * swingStrength;
    });
  }

  segmentSpeeds.value = dragonSegments.value.map((segment, index) => {
    const previousPosition = previousPositions[index];
    return Math.hypot(segment.x - previousPosition.x, segment.y - previousPosition.y);
  });
};

const initializeDragon = () => {
  // 重置龙身、轨迹和鼠标状态，确保切换文本后从一致状态启动。
  const chars = Array.from(dragonTextContent.value);
  const startPoint = { x: 100, y: 100 };

  dragonSegments.value = chars.map((char, index) => ({
    x: startPoint.x - index * segmentDistance,
    y: startPoint.y,
    char,
    angle: 0
  }));

  segmentSpeeds.value = chars.map(() => 0);
  headTrail.value = Array.from({ length: getMaxTrailPoints(chars.length) }, () => ({ ...startPoint }));

  mousePosition.x = startPoint.x;
  mousePosition.y = startPoint.y;
  targetPosition.x = startPoint.x;
  targetPosition.y = startPoint.y;
  mouseMoving.value = false;
  mouseStopTime.value = 0;
  dragonDirection.x = 1;
  dragonDirection.y = 0;
  currentSwingAmplitude.value = baseSwingAmplitude.value;

  syncDragonSegmentsWithTrail();
};

const checkMouseStop = () => {
  // 鼠标停止后逐帧衰减摆动幅度，避免停止瞬间“急刹车”观感。
  const now = Date.now();
  if (mouseMoving.value && now - mouseStopTime.value > mouseStopThreshold) {
    mouseMoving.value = false;
  }

  if (mouseMoving.value) {
    currentSwingAmplitude.value += (baseSwingAmplitude.value - currentSwingAmplitude.value) * 0.1;
    return;
  }

  currentSwingAmplitude.value *= 0.9;
  if (currentSwingAmplitude.value < 0.01) {
    currentSwingAmplitude.value = 0;
  }
};

const updateDragon = () => {
  // 主运动循环：
  // 目标点插值 -> 更新方向 -> 推入头部轨迹 -> 同步全身段位。
  checkMouseStop();

  const dx = targetPosition.x - mousePosition.x;
  const dy = targetPosition.y - mousePosition.y;
  const distance = Math.hypot(dx, dy);
  const previousHead = { x: mousePosition.x, y: mousePosition.y };

  if (!mouseMoving.value && currentSwingAmplitude.value < 0.21) {
    currentSwingAmplitude.value = 0;
  }

  if (distance > 1) {
    mousePosition.x += dx / dragonSpeed.value;
    mousePosition.y += dy / dragonSpeed.value;
  }

  const movedX = mousePosition.x - previousHead.x;
  const movedY = mousePosition.y - previousHead.y;
  const movedDistance = Math.hypot(movedX, movedY);

  if (movedDistance > 0.001) {
    dragonDirection.x = movedX / movedDistance;
    dragonDirection.y = movedY / movedDistance;
  } else if (distance > 0.001) {
    dragonDirection.x = dx / distance;
    dragonDirection.y = dy / distance;
  }

  pushHeadTrailPoint({ x: mousePosition.x, y: mousePosition.y });
  syncDragonSegmentsWithTrail();
};

const setTextCharRef = (lineIndex: number, charIndex: number, el: unknown) => {
  // 用行列拼接键保证字符引用稳定。
  const key = `${lineIndex}-${charIndex}`;
  if (el instanceof HTMLElement) {
    textCharRefs.value[key] = el;
    return;
  }

  delete textCharRefs.value[key];
};

const handleMouseMove = (event: MouseEvent) => {
  // 鼠标坐标换算到容器内部坐标系。
  if (!container.value) {
    return;
  }

  const rect = container.value.getBoundingClientRect();
  targetPosition.x = event.clientX - rect.left;
  targetPosition.y = event.clientY - rect.top;
  mouseMoving.value = true;
  mouseStopTime.value = Date.now();
};

const initializeTextCharStates = () => {
  // 为每个字符创建独立物理状态。
  textCharStates.value = Object.keys(textCharRefs.value).reduce<Record<string, TextCharState>>(
    (states, key) => {
      states[key] = {
        originalX: 0,
        originalY: 0,
        currentX: 0,
        currentY: 0,
        velocityX: 0,
        velocityY: 0,
        isColliding: false
      };
      return states;
    },
    {}
  );
};

const applyTextSnakeCollisions = () => {
  // 碰撞层逻辑：
  // - 进入保持半径：标记碰撞
  // - 穿透修正：沿法线推出
  // - 动态冲量：速度越高，挤开越明显
  if (!container.value) {
    return;
  }

  const containerRect = container.value.getBoundingClientRect();

  dragonSegments.value.forEach((segment, segmentIndex) => {
    const segmentSpeed = segmentSpeeds.value[segmentIndex] ?? 0;
    const collisionIntensity = Math.max(0.35, Math.min(3, segmentSpeed / trailPointSpacing));

    Object.entries(textCharRefs.value).forEach(([key, charEl]) => {
      if (!charEl) {
        return;
      }

      const charState = textCharStates.value[key];
      if (!charState) {
        return;
      }

      const charRect = charEl.getBoundingClientRect();
      const charCenterX = charRect.left - containerRect.left + charRect.width / 2;
      const charCenterY = charRect.top - containerRect.top + charRect.height / 2;
      const dx = charCenterX - segment.x;
      const dy = charCenterY - segment.y;
      const distance = Math.hypot(dx, dy);

      if (distance >= collisionHoldRadius) {
        return;
      }

      charState.isColliding = true;

      const safeDistance = Math.max(distance, 0.001);
      const normalX = distance > 0.001 ? dx / safeDistance : Math.cos(segment.angle + Math.PI / 2);
      const normalY = distance > 0.001 ? dy / safeDistance : Math.sin(segment.angle + Math.PI / 2);
      const penetration = collisionRadius - safeDistance;

      if (penetration > 0) {
        charState.currentX += normalX * penetration * staticPushStrength;
        charState.currentY += normalY * penetration * staticPushStrength;
      }

      const normalVelocity = charState.velocityX * normalX + charState.velocityY * normalY;
      if (normalVelocity < 0) {
        charState.velocityX -= normalVelocity * normalX;
        charState.velocityY -= normalVelocity * normalY;
      }

      if (segmentSpeed > collisionSpeedThreshold) {
        charState.velocityX *= collisionSettling;
        charState.velocityY *= collisionSettling;
        const force = (repulsionForce.value / safeDistance) * collisionIntensity;
        charState.velocityX += normalX * force;
        charState.velocityY += normalY * force;
      } else {
        charState.velocityX = 0;
        charState.velocityY = 0;
      }
    });
  });
};

const checkCollisions = () => {
  if (!container.value) {
    return;
  }

  Object.values(textCharStates.value).forEach((state) => {
    state.isColliding = false;
  });

  applyTextSnakeCollisions();
};

const updateTextCharPositions = () => {
  // 逐字符物理积分：
  // 速度更新 -> 阻尼衰减 -> 非碰撞时回位。
  Object.entries(textCharStates.value).forEach(([key, state]) => {
    const charEl = textCharRefs.value[key];
    if (!charEl) {
      return;
    }

    state.currentX += state.velocityX;
    state.currentY += state.velocityY;
    state.velocityX *= damping.value;
    state.velocityY *= damping.value;

    if (!state.isColliding) {
      const dx = state.originalX - state.currentX;
      const dy = state.originalY - state.currentY;
      state.velocityX += dx * recoverySpeed.value;
      state.velocityY += dy * recoverySpeed.value;

      if (
        Math.abs(state.currentX) < restPositionThreshold &&
        Math.abs(state.currentY) < restPositionThreshold &&
        Math.abs(state.velocityX) < restVelocityThreshold &&
        Math.abs(state.velocityY) < restVelocityThreshold
      ) {
        state.currentX = 0;
        state.currentY = 0;
        state.velocityX = 0;
        state.velocityY = 0;
      }
    } else if (
      Math.abs(state.velocityX) < collisionStaticVelocityThreshold &&
      Math.abs(state.velocityY) < collisionStaticVelocityThreshold
    ) {
      state.velocityX = 0;
      state.velocityY = 0;
    }

    charEl.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
  });
};

let animationId: number | null = null;
const animate = () => {
  // 单帧顺序：更新时间 -> 龙体运动 -> 碰撞 -> 文本物理 -> 下一帧。
  animationClock.value = performance.now();
  updateDragon();
  checkCollisions();
  updateTextCharPositions();
  animationId = requestAnimationFrame(animate);
};

watch(customText, () => {
  // 文本结构变化会导致字符节点重建，先清空引用再下一帧重建状态。
  textCharRefs.value = {};
  nextTick(() => {
    initializeTextCharStates();
  });
});

watch(dragonTextContent, () => {
  initializeDragon();
});

watch(baseSwingAmplitude, (newValue) => {
  if (mouseMoving.value) {
    currentSwingAmplitude.value = newValue;
  }
});

onMounted(() => {
  // 首屏初始化：先建龙，再在 DOM ready 后建字符状态，再启动循环。
  initializeDragon();
  nextTick(() => {
    initializeTextCharStates();
  });
  animate();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.advanced-dragon-playground {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  color: #333;
}

.container {
  /* 容器作为“世界坐标系”，龙和文本都在此绝对定位。 */
  position: relative;
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fafafa;
  cursor: crosshair;
}

.text-container {
  padding: 20px;
  line-height: 1.5;
  font-size: 16px;
  color: #333;
}

.text-line {
  margin-bottom: 10px;
  white-space: nowrap;
}

.text-char {
  display: inline-block;
  transition: transform 0.1s ease;
}

.dragon-segment {
  /* will-change 提前告知浏览器优化位移与旋转，降低动画抖动。 */
  position: absolute;
  z-index: 10;
  color: #ff4500;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  user-select: none;
  will-change: left, top, transform;
}

.dragon-decoration {
  /* 装饰不参与命中与布局，仅作为视觉层叠元素。 */
  position: absolute;
  pointer-events: none;
  transform-origin: center;
  will-change: left, top, transform;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: pre;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
  user-select: none;
}

.dragon-decoration--wing {
  /* 按类型分别给阴影，增强层次区分。 */
  filter: drop-shadow(0 4px 10px rgba(160, 72, 22, 0.22));
}

.dragon-decoration--limb {
  filter: drop-shadow(0 3px 8px rgba(82, 32, 14, 0.18));
}

.dragon-decoration--horn {
  filter: drop-shadow(0 3px 6px rgba(191, 124, 43, 0.2));
}
</style>
