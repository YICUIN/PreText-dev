<template>
  <div class="example-page">
    <h1>基础示例</h1>
    <p>这是PreTeXt的基础使用示例，展示了如何使用核心API进行文本排版。</p>
    
    <PretextDemo 
      title="简单文本排版"
      initialCode="Hello, PreTeXt! 这是一个基础排版示例。"
    />
    
    <PretextDemo 
      title="多行文本"
      initialCode="PreTeXt 是一个高性能的文本排版引擎。\n它可以处理多行文本，并且保持良好的排版效果。"
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