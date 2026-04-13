import { nextTick, ref, type Ref } from "vue";

import type { DragonSegment, TextCharState } from "./types";

// 用最小结构表达“可读的速度向量”。
// 这里不依赖完整 Point 类型，是因为文本物理层只关心当前速度，不关心其他轨迹语义。
type PointLike = {
  x: number;
  y: number;
};

// 文本物理系统依赖父层传入的外部上下文。
// 这些参数共同决定字符位移、碰撞强度、颜色触发和颜色回调速度。
type TextPhysicsOptions = {
  // 舞台容器，用于把字符 DOM 坐标换算成组件内部坐标。
  container: Ref<HTMLElement | null>;
  // 当前龙身各段的位置和朝向，是文本碰撞的“外力输入”。
  dragonSegments: Ref<DragonSegment[]>;
  // 龙当前速度，用来估计碰撞强度与颜色触发强度。
  velocity: PointLike;
  // 文本被挤开时的排斥力度。
  repulsionForce: Ref<number>;
  // 文本回位速度。
  recoverySpeed: Ref<number>;
  // 颜色效果强度，决定触发上色时的最大亮度/饱和度权重。
  colorEffectIntensity: Ref<number>;
  // 颜色回调速度，影响运动中褪色和静止后收尾褪色。
  colorReturnSpeed: Ref<number>;
};

// TextCharLayout 是字符的“静态基准布局”缓存。
// 通过缓存字符中心点，避免每帧在热路径里全量读取 getBoundingClientRect。
type TextCharLayout = {
  centerX: number;
  centerY: number;
};

// 这个 composable 负责：
// 1. 管理字符 DOM 引用和物理状态
// 2. 处理龙身与文本的碰撞和挤压
// 3. 管理颜色触发、颜色回调和最终样式写回
export const useTextCharPhysics = ({
  container,
  dragonSegments,
  velocity,
  repulsionForce,
  recoverySpeed,
  colorEffectIntensity,
  colorReturnSpeed,
}: TextPhysicsOptions) => {
  // textCharRefs: 模板里每个 span 的 DOM 引用
  // textCharStates: 每个字符的动态状态（位移、速度、颜色）
  // textCharLayouts: 每个字符在静态文本流中的基准中心点
  const textCharRefs = ref<Record<string, HTMLElement | null>>({});
  const textCharStates = ref<Record<string, TextCharState>>({});
  const textCharLayouts = ref<Record<string, TextCharLayout>>({});

  // 下面这些参数共同定义“沙粒式文本”观感：
  // - damping: 每帧速度阻尼
  // - collision* / rest*: 碰撞和静止的阈值
  // - colorFade*: 颜色开始快速收尾的阈值
  const damping = ref(0.9);
  const collisionSpeedThreshold = 0.2;
  const collisionRadius = 25;
  const collisionHoldRadius = 40;
  const staticPushStrength = 1;
  const collisionSettling = 0.7;
  const collisionStaticVelocityThreshold = 0.08;
  const restPositionThreshold = 0.05;
  const restVelocityThreshold = 0.05;
  const colorFadeStartVelocityThreshold = 0.05;
  const colorFadeStartPositionThreshold = 0.9;
  const colorTransitionSpeed = ref(0.2);
  const maxHue = ref(360);
  // 随机色盘不是全色相均匀随机，而是从一组更耐看的基础色相里抽样。
  const preferredCollisionHues = [14, 28, 46, 92, 168, 196, 224, 262, 318];

  // colorReturnSpeed 对两个阶段都生效：
  // - 运动恢复中的缓慢褪色
  // - 基本静止后的快速收尾
  const colorFadeSpeedWhileRecovering = () => 0.995 - colorReturnSpeed.value * 0.095;
  const colorFadeSpeedAtRest = () => 0.6 - colorReturnSpeed.value * 0.55;

  // 让 hue 按最短圆弧方向逼近目标色相，避免跨越 360/0 边界时颜色跳变。
  const getShortestHueDelta = (fromHue: number, toHue: number) => {
    return (toHue - fromHue + 540) % 360 - 180;
  };

  // 每一轮有效上色只随机一次基础色相。
  // 这样既能保持“有变化”，又不会在同一次碰撞里不断闪色。
  const getPleasantCollisionHue = () => {
    const baseHue = preferredCollisionHues[Math.floor(Math.random() * preferredCollisionHues.length)] ?? 28;
    const jitter = (Math.random() - 0.5) * 12;
    return (baseHue + jitter + maxHue.value) % maxHue.value;
  };

  // 重新读取字符当前在文本流中的静态布局中心点。
  // 这个操作只在初始化和窗口尺寸变化后做，而不是每帧都做。
  const syncTextCharLayouts = () => {
    if (!container.value) {
      return;
    }

    const containerRect = container.value.getBoundingClientRect();
    const layouts: Record<string, TextCharLayout> = {};

    Object.entries(textCharRefs.value).forEach(([key, charEl]) => {
      if (!charEl) {
        return;
      }

      const charRect = charEl.getBoundingClientRect();
      layouts[key] = {
        centerX: charRect.left - containerRect.left + charRect.width / 2,
        centerY: charRect.top - containerRect.top + charRect.height / 2,
      };
    });

    textCharLayouts.value = layouts;
  };

  // 文本节点重建后，重新初始化每个字符的物理状态。
  // nextTick 是必须的，因为要等 DOM 真正渲染出来后才能同步布局缓存。
  const initializeTextCharStates = async () => {
    await nextTick();
    syncTextCharLayouts();

    textCharStates.value = Object.keys(textCharRefs.value).reduce<Record<string, TextCharState>>((states, key) => {
      states[key] = {
        originalX: 0,
        originalY: 0,
        currentX: 0,
        currentY: 0,
        velocityX: 0,
        velocityY: 0,
        isColliding: false,
        colorBaseHue: -1,
        currentHue: 0,
        targetHue: 0,
        colorStrength: 0,
        targetColorStrength: 0,
        colorVelocity: 0,
      };
      return states;
    }, {});
  };

  // 模板里的 ref 回调统一进入这里。
  // 用 lineIndex-charIndex 作为稳定 key，避免纯字符内容重复时冲突。
  const setTextCharRef = (lineIndex: number, charIndex: number, el: unknown) => {
    const key = `${lineIndex}-${charIndex}`;
    if (el instanceof HTMLElement) {
      textCharRefs.value[key] = el;
      return;
    }

    delete textCharRefs.value[key];
    delete textCharLayouts.value[key];
  };

  // 文本结构变化时整体清空缓存和状态，下一帧重新初始化。
  const resetTextCharRefs = () => {
    textCharRefs.value = {};
    textCharLayouts.value = {};
    textCharStates.value = {};
  };

  // 真正的碰撞检测与力学作用。
  // 思路：
  // 1. 以每段龙身为检测点
  // 2. 用缓存的字符中心点做距离判断
  // 3. 根据距离和当前龙速计算碰撞强度
  // 4. 叠加静态推出和动态冲量
  // 5. 只有当前帧“最强的一次命中”才能决定颜色，避免后续段覆盖前面结果
  const applyTextSnakeCollisions = () => {
    if (!container.value) {
      return;
    }

    const strongestColorIntensityByChar = new Map<string, number>();
    const detectionPoints = dragonSegments.value.map((segment, index) => ({
      x: segment.x,
      y: segment.y,
      radius: index === 0 ? 25 : 20,
      angle: segment.angle,
      index,
    }));

    detectionPoints.forEach((point) => {
      const segmentIndex = point.index;
      // 头部速度作为整体速度基准，后续段按索引做衰减，模拟“身后传导”感觉。
      const headSpeed = Math.hypot(velocity.x, velocity.y);
      const segmentSpeed = segmentIndex === 0 ? headSpeed : headSpeed * (1 - segmentIndex * 0.1);
      const collisionIntensity = Math.max(0.5, Math.min(4, segmentSpeed / 2));

      Object.entries(textCharLayouts.value).forEach(([key, layout]) => {
        const charState = textCharStates.value[key];
        if (!charState) {
          return;
        }

        const charCenterX = layout.centerX + charState.currentX;
        const charCenterY = layout.centerY + charState.currentY;
        const dx = charCenterX - point.x;
        const dy = charCenterY - point.y;
        const distance = Math.hypot(dx, dy);

        if (distance >= collisionHoldRadius) {
          return;
        }

        // 一旦进入保持半径，就认为当前帧处于碰撞中。
        charState.isColliding = true;
        const distanceRatio = 1 - distance / collisionHoldRadius;
        const intensity = Math.pow(distanceRatio, 2) * collisionIntensity;
        const shouldApplyColorEffect = segmentSpeed > collisionSpeedThreshold;
        const previousStrongestIntensity = strongestColorIntensityByChar.get(key) ?? -1;

        if (shouldApplyColorEffect && intensity > previousStrongestIntensity) {
          strongestColorIntensityByChar.set(key, intensity);
          if (charState.colorBaseHue < 0) {
            charState.colorBaseHue = getPleasantCollisionHue();
          }

          // 颜色分成两个维度：
          // - targetHue：色相本身
          // - targetColorStrength：颜色强度
          // 这样褪色时只衰减强度，不会出现统一偏红收尾的问题。
          charState.targetHue = charState.colorBaseHue;
          charState.targetColorStrength = Math.min(1, 0.28 + intensity * 0.22 * colorEffectIntensity.value);
        }

        const safeDistance = Math.max(distance, 0.001);
        const normalX = distance > 0.001 ? dx / safeDistance : Math.cos(point.angle + Math.PI / 2);
        const normalY = distance > 0.001 ? dy / safeDistance : Math.sin(point.angle + Math.PI / 2);
        const penetration = collisionRadius - safeDistance;

        if (penetration > 0) {
          charState.currentX += normalX * penetration * staticPushStrength;
          charState.currentY += normalY * penetration * staticPushStrength;
        }

        // 如果字符当前速度有一部分正朝龙身内部钻进去，先剔除这部分法线速度，避免抖动穿透。
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

  // 每帧碰撞入口。先把“本帧碰撞标记”和“本帧颜色目标”清空，再重新计算。
  const checkCollisions = () => {
    if (!container.value) {
      return;
    }

    Object.values(textCharStates.value).forEach((state) => {
      state.isColliding = false;
      state.targetHue = 0;
      state.targetColorStrength = 0;
    });

    applyTextSnakeCollisions();
  };

  // 每帧更新字符的位移与颜色，并把结果写回到真实 DOM。
  // 整体顺序：
  // 1. 速度积分 -> 位移
  // 2. 碰撞中或非碰撞中的速度修正
  // 3. 更新颜色目标或颜色褪色
  // 4. 最终把 transform / color / textShadow 写回
  const updateTextCharPositions = () => {
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
        // 非碰撞时通过一个很轻的“回位弹簧力”把字符拉回原位。
        state.velocityX += (state.originalX - state.currentX) * recoverySpeed.value;
        state.velocityY += (state.originalY - state.currentY) * recoverySpeed.value;

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

      const isNearlyStill =
        Math.abs(state.currentX) < colorFadeStartPositionThreshold &&
        Math.abs(state.currentY) < colorFadeStartPositionThreshold &&
        Math.abs(state.velocityX) < colorFadeStartVelocityThreshold &&
        Math.abs(state.velocityY) < colorFadeStartVelocityThreshold;

      if (state.targetColorStrength > 0) {
        // 有颜色目标时：快速追目标色相，并根据本帧碰撞强度抬升 colorStrength。
        if (state.colorStrength <= 0.001) {
          state.currentHue = state.targetHue;
        } else {
          state.currentHue += getShortestHueDelta(state.currentHue, state.targetHue) * colorTransitionSpeed.value;
        }

        const strengthDiff = state.targetColorStrength - state.colorStrength;
        state.colorVelocity = strengthDiff * colorTransitionSpeed.value;
        state.colorStrength += state.colorVelocity;
      } else {
        // 没有新的颜色输入时：只衰减颜色强度。
        // 运动中缓慢褪色，接近静止后快速收尾。
        state.colorVelocity = 0;
        state.colorStrength *= isNearlyStill ? colorFadeSpeedAtRest() : colorFadeSpeedWhileRecovering();
        if (state.colorStrength <= 0.02) {
          state.colorStrength = 0;
          state.colorBaseHue = -1;
          state.currentHue = 0;
        }
      }

      // 颜色和发光都由 colorStrength 驱动，强度归零后直接回到默认样式。
      if (state.colorStrength > 0.01) {
        const saturation = 52 + state.colorStrength * 42;
        const lightness = 50 + state.colorStrength * 18;
        charEl.style.color = `hsl(${state.currentHue % 360}, ${saturation}%, ${lightness}%)`;

        const glowIntensity = Math.max(1.5, state.colorStrength * 8 + Math.abs(state.colorVelocity) * 3);
        charEl.style.textShadow = `0 0 ${glowIntensity}px hsl(${state.currentHue % 360}, 100%, 50%)`;
      } else {
        charEl.style.color = "";
        charEl.style.textShadow = "";
      }

      charEl.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
    });
  };

  return {
    textCharRefs,
    initializeTextCharStates,
    setTextCharRef,
    resetTextCharRefs,
    syncTextCharLayouts,
    checkCollisions,
    updateTextCharPositions,
  };
};
