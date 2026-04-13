<template>
  <div class="advanced-dragon-playground">
    <h2>高级龙形文本 Playground</h2>

    <AdvancedDragonControls
      v-model:dragon-text-content="dragonTextContent"
      v-model:dragon-speed="dragonSpeed"
      v-model:base-swing-amplitude="baseSwingAmplitude"
      v-model:repulsion-force="repulsionForce"
      v-model:recovery-speed="recoverySpeed"
      v-model:color-effect-intensity="colorEffectIntensity"
      v-model:color-return-speed="colorReturnSpeed"
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
      v-model:auto-move-enabled="autoMoveEnabled"
      v-model:auto-move-speed="autoMoveSpeed" />

    <div
      ref="container"
      class="container"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      @mouseenter="handleMouseEnter">
      <div class="text-container">
        <div v-for="(line, lineIndex) in displayTexts" :key="lineIndex" class="text-line">
          <span
            v-for="(char, charIndex) in line"
            :key="`${lineIndex}-${charIndex}`"
            :ref="(el) => setTextCharRef(lineIndex, charIndex, el)"
            class="text-char">
            {{ char }}
          </span>
        </div>
      </div>

      <div
        v-for="decoration in dragonDecorations"
        :key="decoration.id"
        class="dragon-decoration"
        :class="[`dragon-decoration--${decoration.kind}`, `dragon-decoration--${decoration.side}`]"
        :style="{
          left: `${decoration.x}px`,
          top: `${decoration.y}px`,
          width: `${decoration.width}px`,
          height: `${decoration.height}px`,
          fontSize: `${decoration.fontSize}px`,
          color: decoration.color,
          zIndex: decoration.zIndex,
          opacity: decoration.opacity,
          transform: `translate(-50%, -50%) rotate(${decoration.rotation}rad) scale(${decoration.scaleX}, ${decoration.scaleY})`,
        }">
        {{ decoration.text }}
      </div>

      <div
        v-for="(segment, index) in dragonSegments"
        :key="index"
        class="dragon-segment"
        :style="{
          left: `${segment.x}px`,
          top: `${segment.y}px`,
          transform: `translate(-50%, -50%) rotate(${segment.angle}rad)`,
        }">
        {{ segment.char }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import AdvancedDragonControls from "./advanced-dragon-playground/AdvancedDragonControlsPanel.vue";
import { useDragonDecorations } from "./advanced-dragon-playground/useDragonDecorations";
import { useDragonMotion } from "./advanced-dragon-playground/useDragonMotion";
import { useTextCharPhysics } from "./advanced-dragon-playground/useTextCharPhysics";

// 主组件现在只负责三件事：
// 1. 持有 UI 配置
// 2. 组装运动、文本物理、装饰三个子系统
// 3. 驱动统一的 requestAnimationFrame 循环
const container = ref<HTMLElement | null>(null);

// 龙身内容和手动跟随参数。
const dragonTextContent = ref(">>>这是一条很长的龙形文本============+++---");
const dragonSpeed = ref(5);
const baseSwingAmplitude = ref(0);

// 装饰参数由控制面板直接驱动，最终交给 useDragonDecorations 统一计算。
const showDragonWings = ref(true);
const showDragonLimbs = ref(true);
const showDragonHorns = ref(true);
const wingDecorationText = ref("-------");
const limbDecorationText = ref("xx");
const hornDecorationText = ref("<<");
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

const autoMoveEnabled = ref(true);
const autoMoveSpeed = ref(25);

// 被龙身挤开的普通文本内容。按换行拆成多行渲染。
const customText = ref(`这是一段会被龙形文本挤开的文本。
当龙在文本间穿行时，字符会像沙子一样贴着龙身。
你可以在这里自由编辑内容，每一行都会单独排列。
停下后文本会尽量回位，但仍会被龙身稳定支撑。`);
const displayTexts = computed(() => customText.value.split("\n"));

const repulsionForce = ref(75);
const recoverySpeed = ref(0.005);
const colorEffectIntensity = ref(1.5);
const colorReturnSpeed = ref(0.75);
// animationClock 只作为装饰层动画的统一时间源。
const animationClock = ref(0);

// useDragonMotion 输出龙身段位和速度。
// 主组件不再关心轨迹采样和边界反弹的内部细节。
const {
  dragonSegments,
  velocity,
  initializeDragon,
  updateDragon,
  handleMouseMove,
  handleMouseLeave,
  handleMouseEnter,
} = useDragonMotion({
  container,
  dragonTextContent,
  dragonSpeed,
  baseSwingAmplitude,
  autoMoveEnabled,
  autoMoveSpeed,
});

// useTextCharPhysics 输出字符 ref 管理、碰撞检测和样式写回能力。
// 它只依赖“当前龙段位 + 当前速度”，和主运动系统保持单向依赖。
const {
  initializeTextCharStates,
  setTextCharRef,
  resetTextCharRefs,
  syncTextCharLayouts,
  checkCollisions,
  updateTextCharPositions,
} = useTextCharPhysics({
  container,
  dragonSegments,
  velocity,
  repulsionForce,
  recoverySpeed,
  colorEffectIntensity,
  colorReturnSpeed,
});

// 装饰层只消费 dragonSegments 和装饰配置，不碰文本物理与输入系统。
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
  ornamentSwaySpeed,
});

let animationId: number | null = null;
// 全局动画顺序固定为：
// 更新时间 -> 更新龙身运动 -> 计算文本碰撞 -> 写回文本样式。
// 这个顺序保证文本看到的是“最新位置的龙”。
const animate = () => {
  animationClock.value = performance.now();
  updateDragon();
  checkCollisions();
  updateTextCharPositions();
  animationId = requestAnimationFrame(animate);
};

// 文本结构变化时，字符节点会重建。
// 这里先清空旧引用，再等下一轮 DOM 渲染后重新建立字符状态。
watch(customText, async () => {
  resetTextCharRefs();
  await initializeTextCharStates();
});

// 龙身文本变化意味着龙段数量变化，需要整体重建龙身。
watch(dragonTextContent, () => {
  initializeDragon();
});

// 首次挂载时先建龙，再建字符状态，再开始动画。
// resize 时只重算文本布局缓存，不需要重建字符状态。
onMounted(async () => {
  initializeDragon();
  await initializeTextCharStates();
  syncTextCharLayouts();
  animate();
  window.addEventListener("resize", syncTextCharLayouts);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener("resize", syncTextCharLayouts);
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
