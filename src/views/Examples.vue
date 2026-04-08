<template>
  <div class="examples">
    <h1>PreTeXt 示例</h1>
    <p>以下是PreTeXt的各种使用示例，您可以查看代码并修改以查看效果。</p>
    
    <div class="example-grid">
      <router-link to="/examples/basic" class="example-card">
        <h3>基础示例</h3>
        <p>展示PreTeXt的基本使用方法</p>
      </router-link>
      <router-link to="/examples/advanced" class="example-card">
        <h3>高级示例</h3>
        <p>展示PreTeXt的高级功能</p>
      </router-link>
      <router-link to="/advanced-dragon-playground" class="example-card">
        <h3>创意示例</h3>
        <p>展示PreTeXt的创意应用</p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.examples {
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

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.example-card {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: #333;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  border: 2px solid transparent;
}

.example-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #4a90e2;
}

.example-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #4a90e2;
}

.example-card p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .examples {
    padding: 20px 15px;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>