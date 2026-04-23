<template>
  <div class="advanced-page">
    <header class="advanced-hero panel">
      <div class="hero-main">
        <span class="eyebrow">Advanced Examples</span>
        <h1>把 PreTeXt 放进真实布局系统里</h1>
        <p class="hero-description">
          基础示例回答的是“单段文本如何测量”，高级示例回答的是“同一批文本如何提前预测、
          批量排版，并在真实界面里复用这些结果”。
        </p>

        <div class="hero-pill-row">
          <span class="hero-pill">Batch prepare</span>
          <span class="hero-pill">Predictive layout</span>
          <span class="hero-pill">UI-ready metrics</span>
        </div>
      </div>

      <div class="hero-side">
        <article class="hero-note">
          <h2>这页怎么读</h2>
          <p>先看消息流预测，理解批量 prepare + 多次 layout；再切到卡片流排版，观察高度预测如何驱动整体布局。</p>
        </article>

        <article class="hero-note">
          <h2>和基础示例的区别</h2>
          <p>这里不再强调单个参数怎么变，而是强调“预测结果如何服务界面结构”，包括消息列表、卡片流和响应式重排。</p>
        </article>
      </div>
    </header>

    <section class="advanced-overview">
      <article class="panel overview-card overview-card-primary">
        <h2>高级示例聚焦什么</h2>
        <ul class="overview-list">
          <li>批量文本的 prepare 复用，而不是单条文本反复测量。</li>
          <li>在改宽度、改行高时，只用 layout 重算，不必重新准备文本。</li>
          <li>把测量结果直接转成聊天气泡、卡片流、响应式排版这样的真实界面。</li>
        </ul>
      </article>

      <article class="panel overview-card">
        <h2>案例路线</h2>
        <div class="case-roadmap">
          <div class="roadmap-step is-current">
            <strong>01 消息流预测</strong>
            <span>已落地</span>
          </div>
          <div class="roadmap-step">
            <strong>02 卡片流排版</strong>
            <span>骨架已预留</span>
          </div>
        </div>
      </article>
    </section>

    <section class="advanced-workspace">
      <div class="tab-shell">
        <div class="example-tabs" role="tablist" aria-label="高级示例案例切换">
          <button
            v-for="tab in exampleTabs"
            :key="tab.id"
            type="button"
            class="tab-button"
            :class="{ active: activeExample === tab.id }"
            :aria-selected="activeExample === tab.id"
            @click="activeExample = tab.id"
          >
            <span class="tab-index">{{ tab.index }}</span>
            <span class="tab-copy">
              <span class="tab-title">{{ tab.title }}</span>
              <span class="tab-subtitle">{{ tab.summary }}</span>
            </span>
          </button>
        </div>
      </div>

      <section class="active-case panel">
        <header class="case-header">
          <div class="case-heading">
            <span class="case-kicker">{{ activeTab.focus }}</span>
            <h2>{{ activeTab.title }}</h2>
          </div>

          <p>{{ activeTab.description }}</p>
        </header>

        <component :is="activeComponent" />
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AdvancedMessageFlowExample from '@/components/advanced-examples/AdvancedMessageFlowExample.vue';
import AdvancedMasonryExample from '@/components/advanced-examples/AdvancedMasonryExample.vue';

type ExampleId = 'chat' | 'masonry';

type ExampleTab = {
  id: ExampleId;
  index: string;
  title: string;
  summary: string;
  focus: string;
  description: string;
};

const exampleTabs: ExampleTab[] = [
  {
    id: 'chat',
    index: '01',
    title: '消息流与高度预测',
    summary: '批量 prepare、气泡宽度、预测高度与实际渲染对照',
    focus: 'Batch Prepare + Predictive Layout',
    description:
      '这个案例展示聊天消息如何在进入 DOM 之前先完成高度预测、宽度计算和紧致包裹判断，适合映射到虚拟列表、评论流和通知列表。',
  },
  {
    id: 'masonry',
    index: '02',
    title: '卡片流与预排版',
    summary: '根据文本高度预先分配列位，后续接入 Masonry 级场景',
    focus: 'Card Flow Planning',
    description:
      '这个案例先保留完整入口与叙事骨架，下一步将围绕卡片高度预测、列分配和响应式重排展开，补足聊天之外的第二类真实产品布局。',
  },
];

const activeExample = ref<ExampleId>('chat');

const activeTab = computed(() => exampleTabs.find((tab) => tab.id === activeExample.value) ?? exampleTabs[0]!);

const activeComponent = computed(() => {
  if (activeExample.value === 'masonry') return AdvancedMasonryExample;
  return AdvancedMessageFlowExample;
});
</script>

<style scoped>
.advanced-page {
  --page-bg: linear-gradient(180deg, #eef5ff 0%, #f7faff 45%, #f1eadf 100%);
  --card-bg: rgba(255, 255, 255, 0.92);
  --card-border: rgba(41, 72, 133, 0.14);
  --headline: #19253f;
  --body: #52627f;
  --muted: #72829d;
  --accent: #1d62d8;
  --accent-strong: #154ca8;
  --accent-soft: rgba(29, 98, 216, 0.1);
  --shadow: 0 18px 42px rgba(30, 56, 109, 0.1);
  padding: 24px 20px 48px;
  min-height: 100%;
  background:
    radial-gradient(circle at 10% 10%, rgba(29, 98, 216, 0.14), transparent 25%),
    radial-gradient(circle at 86% 12%, rgba(220, 128, 48, 0.1), transparent 20%),
    var(--page-bg);
  color: var(--body);
}

.advanced-hero,
.advanced-overview,
.advanced-workspace {
  max-width: 1480px;
  margin: 0 auto;
}

.panel {
  border: 1px solid var(--card-border);
  border-radius: 28px;
  background: var(--card-bg);
  box-shadow: var(--shadow);
}

.advanced-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 18px;
  padding: 26px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(29, 98, 216, 0.14), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 255, 0.96));
}

.hero-main {
  position: relative;
  z-index: 1;
}

.eyebrow,
.case-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.advanced-hero h1,
.active-case h2,
.overview-card h2 {
  margin: 0;
  color: var(--headline);
}

.advanced-hero h1 {
  margin-top: 14px;
  font-size: clamp(2.1rem, 3.8vw, 3.35rem);
  line-height: 1.02;
}

.hero-description {
  margin-top: 16px;
  max-width: 50rem;
  color: #4d5f7d;
  line-height: 1.78;
  font-size: 1.02rem;
}

.hero-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.hero-pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(29, 98, 216, 0.1);
  color: var(--accent-strong);
  font-size: 0.86rem;
  font-weight: 700;
}

.hero-side {
  display: grid;
  gap: 14px;
  align-content: start;
}

.hero-note {
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(242, 247, 255, 0.88);
  border: 1px solid rgba(41, 72, 133, 0.1);
}

.hero-note h2 {
  margin: 0 0 8px;
  color: var(--headline);
  font-size: 1rem;
}

.hero-note p {
  margin: 0;
  line-height: 1.72;
}

.advanced-overview {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 18px;
  margin-top: 18px;
}

.overview-card {
  padding: 22px 24px;
  min-height: 100%;
}

.overview-card-primary {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 255, 0.94));
}

.overview-list {
  display: grid;
  gap: 12px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.overview-list li {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(244, 247, 254, 0.82);
  border: 1px solid rgba(41, 72, 133, 0.08);
  color: #51627f;
  line-height: 1.72;
}

.case-roadmap {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.roadmap-step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(41, 72, 133, 0.08);
}

.roadmap-step strong {
  color: var(--headline);
}

.roadmap-step span {
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 700;
}

.roadmap-step.is-current {
  background: linear-gradient(180deg, rgba(29, 98, 216, 0.1), rgba(29, 98, 216, 0.05));
}

.advanced-workspace {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.tab-shell {
  padding: 10px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.48);
  border: 1px solid rgba(41, 72, 133, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.example-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.tab-button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 18px;
  border: 1px solid rgba(41, 72, 133, 0.12);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.76);
  color: var(--body);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.tab-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(30, 56, 109, 0.08);
}

.tab-button.active {
  border-color: rgba(29, 98, 216, 0.26);
  background: linear-gradient(180deg, rgba(29, 98, 216, 0.12), rgba(255, 255, 255, 0.94));
}

.tab-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(29, 98, 216, 0.1);
  color: var(--accent-strong);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.tab-copy {
  display: grid;
  gap: 6px;
}

.tab-title {
  color: var(--headline);
  font-weight: 700;
}

.tab-subtitle {
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.55;
}

.active-case {
  padding: 22px;
}

.case-header {
  display: grid;
  grid-template-columns: minmax(0, 380px) minmax(0, 1fr);
  gap: 18px;
  align-items: end;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(41, 72, 133, 0.08);
}

.case-heading {
  display: grid;
  gap: 12px;
}

.case-header h2 {
  font-size: clamp(1.55rem, 2.2vw, 2.15rem);
}

.case-header p {
  margin: 0;
  color: var(--muted);
  line-height: 1.72;
}

@media (max-width: 1080px) {
  .advanced-hero,
  .advanced-overview,
  .example-tabs,
  .case-header {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .advanced-page {
    padding: 16px 12px 40px;
  }

  .advanced-hero,
  .overview-card,
  .active-case,
  .tab-button {
    padding: 18px;
  }

  .tab-button {
    grid-template-columns: 1fr;
  }

  .tab-index {
    min-width: 0;
    width: fit-content;
    padding: 0 12px;
  }
}
</style>
