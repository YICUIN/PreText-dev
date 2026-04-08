<template>
  <div class="example-page">
    <h1>创意示例</h1>
    <p>这是PreTeXt的创意使用示例，展示了一些创意排版效果。</p>
    
    <PretextDemo 
      title="多语言文本"
      initialCode="PreTeXt 支持多语言文本排版。这是英文文本。这是中文文本：你好，PreTeXt！这是日文文本：こんにちは、PreTeXt！"
      :options="{
        lineHeight: 1.6,
        font: '16px Arial, sans-serif'
      }"
    />
    
    <PretextDemo 
      title="特殊字符"
      initialCode="PreTeXt 可以处理各种特殊字符：© ® ™ € £ $ ¥ ± × ÷ ∑ ∫ √ ∝ ∞ ∠ ∵ ∴ ⊥ ∥ ≡ ≈ ≠ ≮ ≯ ≤ ≥ ∈ ∉ ⊂ ⊃ ⊆ ⊇ ∪ ∩ ∂ ∆ ∇ φ θ λ μ π ω α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω"
      :options="{
        lineHeight: 1.8,
        font: '16px Arial, sans-serif'
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