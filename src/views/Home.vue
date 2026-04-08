<template>
  <div class="home">
    <section class="hero">
      <p class="eyebrow">PreTeXt Showcase</p>
      <h1>让文本排版从可用，走向可控</h1>
      <p class="subtitle">
        这是一个面向产品与前端团队的 PreTeXt 展示站：你可以快速理解核心 API，
        直接运行示例，并通过可视化参数调节观察真实布局效果。
      </p>
      <div class="hero-actions">
        <router-link to="/documentation" class="btn primary">阅读文档</router-link>
        <router-link to="/examples" class="btn secondary">浏览示例</router-link>
      </div>
      <div class="hero-metrics">
        <div class="metric">
          <strong>Install in Minutes</strong>
          <span>安装、引入、运行，按文档一步到位。</span>
        </div>
        <div class="metric">
          <strong>API-first</strong>
          <span>核心 API 参数与返回结构清晰可查。</span>
        </div>
        <div class="metric">
          <strong>Live Playground</strong>
          <span>示例支持实时调参，理解更直观。</span>
        </div>
      </div>
    </section>

    <section class="features">
      <article class="feature">
        <h3>面向真实产品场景</h3>
        <p>不仅展示 API 本身，还展示文本布局在互动页面中的实际接入方式。</p>
      </article>
      <article class="feature">
        <h3>文档与示例同路径学习</h3>
        <p>先看快速开始，再对照示例调参数，减少理解落差。</p>
      </article>
      <article class="feature">
        <h3>支持创意扩展</h3>
        <p>从基础排版到高级可视化交互，逐步扩展你的文本表现能力。</p>
      </article>
    </section>

    <section class="next-step">
      <h2>建议学习路径</h2>
      <p>先进入文档页完成安装与快速开始，再回到示例页查看基础与高级案例。</p>
      <router-link to="/documentation" class="text-link">现在开始</router-link>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.hero {
  /* 多层渐变叠加：既保证品牌色统一，也让背景更有空间层次。 */
  text-align: center;
  padding: 64px 28px;
  border-radius: 18px;
  color: #fff;
  background:
    radial-gradient(circle at 12% 20%, rgba(255, 255, 255, 0.2), transparent 26%),
    radial-gradient(circle at 86% 20%, rgba(255, 255, 255, 0.12), transparent 28%),
    linear-gradient(140deg, #173a92, #1d6ac2 55%, #17a9b5);
  box-shadow: 0 14px 30px rgba(16, 52, 120, 0.28);
  margin-bottom: 36px;
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.88;
}

.hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4.2vw, 3.25rem);
  line-height: 1.15;
}

.subtitle {
  max-width: 760px;
  margin: 18px auto 26px;
  line-height: 1.7;
  font-size: 1.06rem;
  opacity: 0.95;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.btn {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn.primary {
  background: #ffffff;
  color: #1b489e;
}

.btn.primary:hover {
  /* 主按钮 hover 阴影更强，用于强化主操作优先级。 */
  box-shadow: 0 8px 20px rgba(22, 38, 93, 0.24);
}

.btn.secondary {
  border: 1px solid rgba(255, 255, 255, 0.78);
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.hero-metrics {
  /* 指标区采用网格布局，移动端在 media 中降为单列。 */
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric {
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 12px;
}

.metric strong {
  display: block;
  margin-bottom: 6px;
  font-size: 0.96rem;
}

.metric span {
  font-size: 0.86rem;
  line-height: 1.4;
  opacity: 0.92;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.feature {
  padding: 22px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e6ecf7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.feature h3 {
  margin: 0 0 10px;
  color: #1d4cb6;
}

.feature p {
  margin: 0;
  color: #4f5f7f;
  line-height: 1.7;
}

.next-step {
  margin-top: 22px;
  padding: 26px;
  border-radius: 14px;
  border: 1px solid #e6ecf7;
  background: linear-gradient(180deg, #fff, #f8fbff);
}

.next-step h2 {
  margin: 0 0 10px;
  font-size: 1.35rem;
  color: #1c2f63;
}

.next-step p {
  margin: 0 0 10px;
  color: #4e5f85;
  line-height: 1.65;
}

.text-link {
  color: #2560d8;
  font-weight: 700;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .home {
    padding: 16px;
  }

  .hero {
    padding: 42px 16px;
  }

  .hero-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
