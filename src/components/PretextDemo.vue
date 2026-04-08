<!-- PreTeXt演示组件 -->
<template>
  <div class="pretext-demo">
    <h2>{{ title }}</h2>
    <div class="demo-container" ref="container"></div>
    <div class="code-editor">
      <textarea v-model="code" @input="updateCode" placeholder="输入要排版的文本..."></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

const props = defineProps<{
  title: string;
  initialCode: string;
  options?: {
    font?: string;
    maxWidth?: number;
    lineHeight?: number;
  };
}>();

const container = ref<HTMLElement | null>(null);
const code = ref(props.initialCode);
// 编辑区文本是预览渲染源，任何变化都会触发重新排版。

const updateCode = () => {
  renderText();
};

const renderText = () => {
  // 每次渲染先清空容器，避免旧渲染残留导致重复内容。
  if (container.value) {
    // 清除容器
    container.value.innerHTML = "";
    // 使用PreTeXt渲染

    // 获取配置选项
    const font = props.options?.font || "16px Arial";
    // 默认宽度减去容器左右内边距，避免文本贴边。
    const maxWidth = props.options?.maxWidth || container.value.clientWidth - 40; // 减去内边距
    const lineHeight = props.options?.lineHeight || 1.5;

    try {
      // 准备文本
      // 1) 文本预处理：转换成可布局的数据结构。
      const prepared = prepareWithSegments(code.value, font);

      // 布局文本
      // 2) 布局计算：根据宽度和行高得到逐行结果。
      const layoutResult = layoutWithLines(prepared, maxWidth, lineHeight);

      // 渲染文本
      // 3) DOM 渲染：将每一行文本落到容器中。
      layoutResult.lines.forEach((line) => {
        const lineElement = document.createElement("div");
        lineElement.textContent = line.text;
        lineElement.style.font = font;
        lineElement.style.lineHeight = `${lineHeight}em`;
        lineElement.style.marginBottom = "4px";
        container.value?.appendChild(lineElement);
      });
    } catch (error) {
      console.error("PreTeXt渲染错误:", error);
      container.value.textContent = "渲染错误: " + (error as Error).message;
    }
  }
};

onMounted(() => {
  // 首屏初始化渲染。
  renderText();
});

watch(code, () => {
  // 输入变化后实时刷新预览。
  renderText();
});
</script>

<style scoped>
.pretext-demo {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.demo-container {
  margin: 20px 0;
  padding: 20px;
  background-color: white;
  border: 1px solid #e0e0e0;
  min-height: 200px;
}

.code-editor {
  margin-top: 20px;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  font-family: "Courier New", Courier, monospace;
}
</style>
