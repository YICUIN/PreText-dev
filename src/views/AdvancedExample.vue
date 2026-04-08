<template>
  <div class="example-page">
    <h1>高级示例</h1>
    <p>这是PreTeXt的高级使用示例，展示了如何使用不同的字体和样式。</p>
    
    <PretextDemo 
      title="不同字体样式"
      initialCode="PreTeXt 是一个高性能的文本排版引擎，它可以实现各种复杂的排版效果。"
      :options="{
        lineHeight: 1.8,
        font: '18px Arial'
      }"
    />
    
    <PretextDemo 
      title="长文本处理"
      initialCode="PreTeXt 是一个高性能的文本排版引擎。它通过跳过 DOM reflow 来实现极高的排版性能。PreTeXt 由前端工程师 Cheng Lou 开发，是一个纯 JavaScript 文本排版引擎。它的核心创新在于找到了解决 DOM reflow 性能问题的'后门'：利用浏览器的 canvas.measureText() API 进行文本测量，结合 DOM 渲染使用同一套字体引擎的特性，避免了传统排版中频繁的 DOM 操作和重排。PreTeXt 不仅性能优异，而且体积小巧，仅 15KB，非常适合在各种项目中使用。"
      :options="{
        lineHeight: 1.6,
        font: '16px Georgia'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import PretextDemo from '../components/PretextDemo.vue';
</script>

<style scoped>
.example-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

p {
  font-size: 1.1rem;
  margin-bottom: 40px;
  color: #666;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .example-page {
    padding: 20px 15px;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>