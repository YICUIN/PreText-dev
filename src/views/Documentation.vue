<template>
  <div class="documentation">
    <header class="doc-hero">
      <p class="eyebrow">Documentation</p>
      <h1>PreTeXt 使用文档</h1>
      <p>按“安装 → 快速开始 → API → 示例”的顺序，完成从接入到调优的完整路径。</p>
    </header>

    <nav class="doc-nav">
      <a href="#install">安装</a>
      <a href="#quick-start">快速开始</a>
      <a href="#api">API</a>
      <a href="#examples">示例</a>
    </nav>

    <section id="install" class="doc-section">
      <h2>安装</h2>
      <p>在你的项目中安装 PreTeXt：</p>
      <pre><code>npm i @chenglou/pretext</code></pre>
      <p>如果你使用 pnpm：</p>
      <pre><code>pnpm add @chenglou/pretext</code></pre>
    </section>

    <section id="quick-start" class="doc-section">
      <h2>快速开始</h2>
      <p>以下是最小可运行示例，包含准备文本、布局以及最终渲染：</p>
      <pre><code>{{ quickStartCode }}</code></pre>
    </section>

    <section id="api" class="doc-section">
      <h2>API</h2>

      <article class="api-card">
        <h3><code>prepareWithSegments(text, font, options?)</code></h3>
        <p>对输入文本进行预处理，返回可用于布局计算的结构化结果。</p>
        <ul>
          <li><strong>text</strong>：待排版的原始文本。</li>
          <li><strong>font</strong>：字体描述，例如 <code>"16px Arial"</code>。</li>
          <li><strong>options</strong>：可选配置，如空白符处理策略等。</li>
        </ul>
      </article>

      <article class="api-card">
        <h3><code>layoutWithLines(prepared, maxWidth, lineHeight)</code></h3>
        <p>将预处理结果按最大宽度和行高进行排版，返回逐行布局结果。</p>
        <ul>
          <li><strong>prepared</strong>：<code>prepareWithSegments</code> 的返回值。</li>
          <li><strong>maxWidth</strong>：每行最大宽度（px）。</li>
          <li><strong>lineHeight</strong>：行高倍数或像素值（取决于项目约定）。</li>
        </ul>
      </article>
    </section>

    <section id="examples" class="doc-section">
      <h2>示例</h2>
      <p>建议按以下顺序查看示例页面：</p>
      <ol>
        <li>基础示例：确认最小接入流程。</li>
        <li>高级示例：查看复杂排版参数组合。</li>
        <li>高级龙形 Playground：观察文本布局与交互表现的结合方式。</li>
      </ol>
      <div class="example-links">
        <router-link to="/examples/basic">基础示例</router-link>
        <router-link to="/examples/advanced">高级示例</router-link>
        <router-link to="/advanced-dragon-playground">高级 Playground</router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const quickStartCode = `import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

const source = 'Hello PreTeXt';
const font = '16px Arial';

const prepared = prepareWithSegments(source, font);
const result = layoutWithLines(prepared, 320, 1.6);

result.lines.forEach((line) => {
  const el = document.createElement('div');
  el.textContent = line.text;
  el.style.font = font;
  el.style.lineHeight = '1.6';
  container.appendChild(el);
});`;
</script>

<style scoped>
.documentation {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.doc-hero {
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #3a5cad;
}

.doc-hero h1 {
  margin: 0 0 10px;
  font-size: clamp(2rem, 4vw, 2.6rem);
  color: #1f2f53;
}

.doc-hero p {
  margin: 0;
  color: #5a6b8b;
  line-height: 1.7;
}

.doc-nav {
  /* 粘性目录条：滚动阅读长文档时，章节导航始终可见。 */
  position: sticky;
  top: 10px;
  z-index: 4;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px;
  margin: 20px 0;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e6ecf7;
  border-radius: 12px;
  backdrop-filter: blur(6px);
}

.doc-nav a {
  text-decoration: none;
  color: #235bd1;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 999px;
}

.doc-nav a:hover {
  background: #edf3ff;
}

.doc-section {
  /* 每个章节统一卡片化，减少长文档视觉疲劳。 */
  background: #fff;
  border: 1px solid #e6ecf7;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 16px;
}

.doc-section h2 {
  margin: 0 0 12px;
  color: #1f2f53;
}

.doc-section p {
  margin: 0 0 10px;
  color: #50607f;
  line-height: 1.7;
}

.api-card {
  padding: 14px;
  border-radius: 10px;
  background: #f9fbff;
  border: 1px solid #e5ecfb;
}

.api-card + .api-card {
  margin-top: 12px;
}

.api-card h3 {
  margin: 0 0 8px;
  color: #1d4cb6;
  font-size: 1.06rem;
}

.api-card ul,
.doc-section ol {
  margin: 0;
  padding-left: 20px;
  color: #50607f;
  line-height: 1.7;
}

pre {
  /* 深色代码块增强代码段与正文的视觉分离。 */
  margin: 10px 0;
  padding: 14px;
  border-radius: 10px;
  background: #12172a;
  color: #e8ecff;
  overflow-x: auto;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9rem;
}

.example-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.example-links a {
  text-decoration: none;
  font-weight: 600;
  color: #1f5fdb;
  border: 1px solid #d6e2fa;
  border-radius: 999px;
  padding: 8px 12px;
  background: #f7faff;
}

.example-links a:hover {
  background: #edf3ff;
}

@media (max-width: 768px) {
  .documentation {
    padding: 16px;
  }

  .doc-section {
    padding: 18px;
  }
}
</style>
