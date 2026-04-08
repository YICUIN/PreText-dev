<template>
  <div class="dragon-playground">
    <h2>高级龙形文本碰撞效果</h2>
    <p>移动鼠标控制龙形文本，观察其他文本的碰撞和复原效果。</p>
    
    <div class="playground-content">
      <div class="editor-section">
        <h3>编辑文本内容</h3>
        <textarea 
          v-model="customText" 
          placeholder="输入要显示的文本，每行一段..."
          class="text-editor"
        ></textarea>
        
        <h3>配置选项</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>龙形文本内容</label>
            <input 
              type="text" 
              v-model="dragonTextContent" 
            >
          </div>
          <div class="config-item">
            <label>排斥力大小</label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              v-model.number="repulsionForce" 
            >
            <span>{{ repulsionForce }}</span>
          </div>
          <div class="config-item">
            <label>复原速度</label>
            <input 
              type="range" 
              min="0.01" 
              max="0.1" 
              step="0.01" 
              v-model.number="recoverySpeed" 
            >
            <span>{{ recoverySpeed }}</span>
          </div>
          <div class="config-item">
            <label>龙的速度</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="0.1" 
              v-model.number="dragonSpeed" 
            >
            <span>{{ dragonSpeed }}</span>
          </div>
          <div class="config-item">
            <label>摆动幅度</label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.1" 
              v-model.number="swingAmplitude" 
            >
            <span>{{ swingAmplitude }}</span>
          </div>
        </div>
      </div>
      
      <div class="preview-section">
        <h3>预览效果</h3>
        <div class="dragon-text-container" ref="container" @mousemove="handleMouseMove">
          <!-- 龙形文本的每个字符作为一个段落 -->
          <div 
            v-for="(segment, index) in dragonSegments" 
            :key="index" 
            class="dragon-segment"
            :style="{ 
              left: segment.x + 'px', 
              top: segment.y + 'px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#ff4500',
              position: 'absolute',
              zIndex: 10,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              transition: 'left 0.1s ease, top 0.1s ease'
            }"
          >
            {{ segment.char }}
          </div>
          
          <!-- 文本内容，每个字符单独处理 -->
          <div 
            v-for="(text, textIndex) in displayTexts" 
            :key="textIndex" 
            class="content-line"
            :style="{
              position: 'relative',
              margin: '8px 0',
              lineHeight: '1.6'
            }"
          >
            <span 
              v-for="(char, charIndex) in text.split('')" 
              :key="charIndex"
              class="text-char"
              :ref="el => textCharRefs[textIndex * 1000 + charIndex] = el as HTMLElement"
              :style="{
                position: 'relative',
                display: 'inline-block',
                transition: 'transform 0.1s ease-out'
              }"
            >
              {{ char }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, watch, nextTick } from 'vue';

// 容器和引用
const container = ref<HTMLElement | null>(null);
const textCharRefs = ref<Record<number, HTMLElement | null>>({});
// 使用数值键索引字符 DOM，便于动画帧里快速回查。

// 龙的配置
const dragonTextContent = ref('🐉 这是一条很长的龙形文本，它会像真正的龙一样摆动身体，并且可以穿插在文本之中 🐉');
const dragonSpeed = ref(5);
const swingAmplitude = ref(5);
const dragonSegments = ref<Array<{x: number, y: number, char: string}>>([]);
// 简化模型：每段只存位置和字符，不维护角度。

// 鼠标位置
const mousePosition = reactive({ x: 100, y: 100 });
const targetPosition = reactive({ x: 100, y: 100 });
// targetPosition 接收鼠标输入，mousePosition 负责平滑追踪。

// 文本配置
const customText = ref(`这是一段会被龙形文本撞开的文本。
当龙形文本移动时，这段文本会被推开。
当龙形文本离开后，这段文本会慢慢恢复原位。
如果龙形文本停留在某个位置，这段文本会围绕它布局。
您可以在此编辑文本内容，每行一段。`);

const displayTexts = ref(customText.value.split('\n'));

// 文本字符状态
const textCharStates = ref<Record<number, {
  originalX: number;
  originalY: number;
  currentX: number;
  currentY: number;
  velocityX: number;
  velocityY: number;
  isColliding: boolean;
}>>({});

// 物理参数
const repulsionForce = ref(30);
const recoverySpeed = ref(0.05);
const damping = ref(0.9);
// 阻尼控制字符速度衰减，值越大“滑行感”越强。

// 鼠标移动处理
const handleMouseMove = (event: MouseEvent) => {
  // 将 viewport 坐标换算到容器局部坐标。
  if (container.value) {
    const rect = container.value.getBoundingClientRect();
    targetPosition.x = event.clientX - rect.left;
    targetPosition.y = event.clientY - rect.top;
  }
};

// 初始化龙的段落
const initializeDragon = () => {
  // 文本拆字后按固定间距横向初始化段位。
  const chars = dragonTextContent.value.split('');
  dragonSegments.value = chars.map((char, index) => ({
    x: 100 + index * 20,
    y: 100,
    char
  }));
};

// 初始化文本字符状态
const initializeTextCharStates = () => {
  // 每个字符拥有独立位移/速度/碰撞状态，支持逐字动态。
  textCharStates.value = {};
  Object.keys(textCharRefs.value).forEach(key => {
    const index = parseInt(key);
    textCharStates.value[index] = {
      originalX: 0,
      originalY: 0,
      currentX: 0,
      currentY: 0,
      velocityX: 0,
      velocityY: 0,
      isColliding: false
    };
  });
};

// 更新龙的位置和动画
const updateDragon = () => {
  // 头段追踪鼠标，后续段追踪上一段，再叠加正弦摆动。
  // 平滑移动龙的头部
  mousePosition.x += (targetPosition.x - mousePosition.x) / dragonSpeed.value;
  mousePosition.y += (targetPosition.y - mousePosition.y) / dragonSpeed.value;
  
  // 更新龙的各个段落，实现蛇形效果
  dragonSegments.value.forEach((segment, index) => {
    const targetX = index === 0 ? mousePosition.x : dragonSegments.value[index - 1].x - 20;
    const targetY = index === 0 ? mousePosition.y : dragonSegments.value[index - 1].y;
    
    segment.x += (targetX - segment.x) / 3;
    segment.y += (targetY - segment.y) / 3;
    
    // 添加摆动效果
    if (index > 0) {
      segment.y += Math.sin(Date.now() * 0.005 + index) * swingAmplitude.value;
    }
  });
};

// 碰撞检测
const checkCollisions = () => {
  // 近似碰撞：按字符中心与段位中心距离施加反向冲量。
  if (!container.value) return;
  
  // 检查每个龙的段落与文本字符的碰撞
  dragonSegments.value.forEach(segment => {
    Object.entries(textCharRefs.value).forEach(([key, charEl]) => {
      const index = parseInt(key);
      if (charEl) {
        const charRect = charEl.getBoundingClientRect();
        const containerRect = container.value!.getBoundingClientRect();
        
        const charCenterX = charRect.left - containerRect.left + charRect.width / 2;
        const charCenterY = charRect.top - containerRect.top + charRect.height / 2;
        
        const distanceX = Math.abs(charCenterX - segment.x);
        const distanceY = Math.abs(charCenterY - segment.y);
        
        // 碰撞检测
        if (distanceX < 20 && distanceY < 20) {
          if (textCharStates.value[index]) {
            textCharStates.value[index].isColliding = true;
            
            // 计算排斥力
            const dx = charCenterX - segment.x;
            const dy = charCenterY - segment.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const force = repulsionForce.value / distance;
              textCharStates.value[index].velocityX += (dx / distance) * force;
              textCharStates.value[index].velocityY += (dy / distance) * force;
            }
          }
        } else {
          if (textCharStates.value[index]) {
            textCharStates.value[index].isColliding = false;
          }
        }
      }
    });
  });
};

// 更新文本字符位置
const updateTextCharPositions = () => {
  // 欧拉积分：先应用速度，再阻尼，再按回位弹性纠偏。
  Object.entries(textCharStates.value).forEach(([key, state]) => {
    const index = parseInt(key);
    const charEl = textCharRefs.value[index];
    
    if (charEl) {
      // 应用速度
      state.currentX += state.velocityX;
      state.currentY += state.velocityY;
      
      // 应用阻尼
      state.velocityX *= damping.value;
      state.velocityY *= damping.value;
      
      // 如果没有碰撞，慢慢恢复原位
      if (!state.isColliding) {
        const dx = state.originalX - state.currentX;
        const dy = state.originalY - state.currentY;
        state.velocityX += dx * recoverySpeed.value;
        state.velocityY += dy * recoverySpeed.value;
      }
      
      // 更新文本位置
      charEl.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
    }
  });
};

// 动画循环
let animationId: number | null = null;
const animate = () => {
  // 主循环顺序：龙体更新 -> 碰撞计算 -> 文本状态更新。
  updateDragon();
  checkCollisions();
  updateTextCharPositions();
  animationId = requestAnimationFrame(animate);
};

// 监听文本变化
watch(customText, () => {
  displayTexts.value = customText.value.split('\n');
  nextTick(() => {
    initializeTextCharStates();
  });
});

// 监听龙形文本变化
watch(dragonTextContent, () => {
  initializeDragon();
});

onMounted(() => {
  // 初始化
  initializeDragon();
  
  // 等待DOM更新后初始化文本状态
  nextTick(() => {
    initializeTextCharStates();
  });
  
  // 开始动画
  animate();
});

onUnmounted(() => {
  // 停止动画
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.dragon-playground {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #333;
  text-align: center;
}

p {
  font-size: 1.1rem;
  margin-bottom: 30px;
  color: #666;
  text-align: center;
}

.playground-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.editor-section,
.preview-section {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #4a90e2;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.text-editor {
  width: 100%;
  height: 200px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f9f9f9;
  margin-bottom: 20px;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.config-item label {
  font-size: 0.9rem;
  color: #666;
}

.config-item input[type="range"] {
  width: 100%;
}

.config-item input[type="text"] {
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.config-item span {
  font-size: 0.9rem;
  color: #666;
}

.dragon-text-container {
  position: relative;
  width: 100%;
  height: 500px;
  border: 2px solid #4a90e2;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
  padding: 40px;
  cursor: crosshair;
}

.content-line {
  position: relative;
  z-index: 1;
}

.text-char {
  position: relative;
  z-index: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playground-content {
    grid-template-columns: 1fr;
  }
  
  .dragon-text-container {
    height: 400px;
    padding: 20px;
  }
}
</style>
