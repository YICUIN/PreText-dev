<template>
  <div class="dragon-text-container" ref="container">
    <div class="dragon-text" ref="dragonText" :style="{ left: dragonPosition.x + 'px', top: dragonPosition.y + 'px' }">
      🐉 龙形文本 🐉
    </div>
    <div class="content-text" v-for="(text, index) in texts" :key="index" :ref="el => textRefs[index] = el as HTMLElement">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue';

const container = ref<HTMLElement | null>(null);
const dragonText = ref<HTMLElement | null>(null);
const textRefs = ref<(HTMLElement | null)[]>([]);
// 这是“单块龙文本 + 多行普通文本”的最小碰撞演示组件。

const dragonPosition = reactive({
  x: 100,
  y: 100
});

const texts = [
  "这是一段会被龙形文本撞开的文本。",
  "当龙形文本移动时，这段文本会被推开。",
  "当龙形文本离开后，这段文本会慢慢恢复原位。",
  "如果龙形文本停留在某个位置，这段文本会围绕它布局。"
];

// 文本位置和速度
const textStates = reactive(texts.map(() => ({
  originalX: 0,
  originalY: 0,
  currentX: 0,
  currentY: 0,
  velocityX: 0,
  velocityY: 0,
  isColliding: false
})));
// 每行文本维护独立速度与位移，模拟被龙文本推动后的惯性。

// 鼠标移动处理
const handleMouseMove = (event: MouseEvent) => {
  // 鼠标驱动龙文本位置，实时触发碰撞检测。
  if (container.value) {
    const rect = container.value.getBoundingClientRect();
    dragonPosition.x = event.clientX - rect.left - 50; // 50是龙形文本的一半宽度
    dragonPosition.y = event.clientY - rect.top - 20; // 20是龙形文本的一半高度
    checkCollisions();
  }
};

// 碰撞检测
const checkCollisions = () => {
  // 使用包围盒中心距离做近似碰撞，计算简单且实时性高。
  if (!dragonText.value || !container.value) return;
  
  const dragonRect = dragonText.value.getBoundingClientRect();
  textRefs.value.forEach((textEl, index) => {
    if (textEl) {
      const textRect = textEl.getBoundingClientRect();
      const distanceX = Math.abs((dragonRect.left + dragonRect.width/2) - (textRect.left + textRect.width/2));
      const distanceY = Math.abs((dragonRect.top + dragonRect.height/2) - (textRect.top + textRect.height/2));
      
      if (distanceX < (dragonRect.width/2 + textRect.width/2) && 
          distanceY < (dragonRect.height/2 + textRect.height/2)) {
        // 发生碰撞
        textStates[index].isColliding = true;
        
        // 计算排斥力
        const dx = (textRect.left + textRect.width/2) - (dragonRect.left + dragonRect.width/2);
        const dy = (textRect.top + textRect.height/2) - (dragonRect.top + dragonRect.height/2);
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance > 0) {
          const force = 50 / distance; // 排斥力大小
          textStates[index].velocityX += (dx / distance) * force;
          textStates[index].velocityY += (dy / distance) * force;
        }
      } else {
        textStates[index].isColliding = false;
      }
    }
  });
};

// 更新文本位置
const updateTextPositions = () => {
  // 先更新速度，再施加阻尼；非碰撞状态时向原位回弹。
  textStates.forEach((state, index) => {
    if (!textRefs.value[index]) return;
    
    // 应用速度
    state.currentX += state.velocityX;
    state.currentY += state.velocityY;
    
    // 应用阻尼
    state.velocityX *= 0.9;
    state.velocityY *= 0.9;
    
    // 如果没有碰撞，慢慢恢复原位
    if (!state.isColliding) {
      const dx = state.originalX - state.currentX;
      const dy = state.originalY - state.currentY;
      state.velocityX += dx * 0.05;
      state.velocityY += dy * 0.05;
    }
    
    // 更新文本位置
    textRefs.value[index]!.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
  });
};

// 动画循环
let animationId: number | null = null;
const animate = () => {
  // 本演示只做文本物理刷新，龙文本位置由鼠标事件驱动。
  updateTextPositions();
  animationId = requestAnimationFrame(animate);
};

onMounted(() => {
  // 初始化状态后再绑定鼠标监听，保证首帧数据完整。
  // 初始化文本原始位置
  textRefs.value.forEach((textEl, index) => {
    if (textEl) {
      textStates[index].originalX = 0;
      textStates[index].originalY = 0;
      textStates[index].currentX = 0;
      textStates[index].currentY = 0;
    }
  });
  
  // 添加鼠标移动事件监听
  if (container.value) {
    container.value.addEventListener('mousemove', handleMouseMove);
  }
  
  // 开始动画
  animate();
});

onUnmounted(() => {
  // 清理事件和 RAF，避免离开页面后仍在后台执行。
  // 移除事件监听
  if (container.value) {
    container.value.removeEventListener('mousemove', handleMouseMove);
  }
  
  // 停止动画
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.dragon-text-container {
  position: relative;
  width: 100%;
  height: 400px;
  border: 2px solid #4a90e2;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
  padding: 20px;
}

.dragon-text {
  position: absolute;
  font-size: 20px;
  font-weight: bold;
  color: #ff4500;
  white-space: nowrap;
  cursor: pointer;
  z-index: 10;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.content-text {
  position: relative;
  margin: 10px 0;
  font-size: 16px;
  line-height: 1.5;
  transition: transform 0.1s ease-out;
  z-index: 1;
}
</style>
