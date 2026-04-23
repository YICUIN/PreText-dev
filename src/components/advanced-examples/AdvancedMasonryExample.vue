<template>
  <div class="masonry-demo">
    <section class="top-grid">
      <aside class="panel controls-panel">
        <div class="section-heading">
          <h3>排版控制</h3>
          <p>这个案例把文本预测结果直接用于卡片流分栏，让 Masonry 类场景不必先把卡片全量渲染进 DOM 再测高度。</p>
        </div>

        <div class="dataset-group">
          <span class="field-label">数据集</span>
          <div class="dataset-row">
            <button
              v-for="dataset in datasets"
              :key="dataset.id"
              type="button"
              class="chip-button"
              :class="{ active: selectedDatasetId === dataset.id }"
              @click="selectedDatasetId = dataset.id"
            >
              {{ dataset.label }}
            </button>
          </div>
          <p class="field-help">{{ activeDataset.description }}</p>
        </div>

        <div class="field-grid">
          <label class="field">
            <span class="field-label">画布宽度</span>
            <div class="range-row">
              <input v-model.number="boardWidth" type="range" min="760" max="1320" step="20" />
              <label class="number-wrap">
                <input v-model.number="boardWidth" type="number" min="760" max="1320" step="20" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">最小列宽</span>
            <div class="range-row">
              <input v-model.number="minColumnWidth" type="range" min="220" max="360" step="10" />
              <label class="number-wrap">
                <input v-model.number="minColumnWidth" type="number" min="220" max="360" step="10" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">卡片间距</span>
            <div class="range-row">
              <input v-model.number="columnGap" type="range" min="10" max="28" step="1" />
              <label class="number-wrap">
                <input v-model.number="columnGap" type="number" min="10" max="28" step="1" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">卡片内边距</span>
            <div class="range-row">
              <input v-model.number="cardPadding" type="range" min="14" max="26" step="1" />
              <label class="number-wrap">
                <input v-model.number="cardPadding" type="number" min="14" max="26" step="1" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">标题字号</span>
            <div class="range-row">
              <input v-model.number="titleFontSize" type="range" min="16" max="28" step="1" />
              <label class="number-wrap">
                <input v-model.number="titleFontSize" type="number" min="16" max="28" step="1" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">摘要字号</span>
            <div class="range-row">
              <input v-model.number="bodyFontSize" type="range" min="13" max="20" step="1" />
              <label class="number-wrap">
                <input v-model.number="bodyFontSize" type="number" min="13" max="20" step="1" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">标题行高</span>
            <div class="range-row">
              <input v-model.number="titleLineHeightMultiplier" type="range" min="1.1" max="1.5" step="0.05" />
              <label class="number-wrap">
                <input
                  v-model.number="titleLineHeightMultiplier"
                  type="number"
                  min="1.1"
                  max="1.5"
                  step="0.05"
                  class="number-input"
                />
                <span>x</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">摘要行高</span>
            <div class="range-row">
              <input v-model.number="bodyLineHeightMultiplier" type="range" min="1.35" max="1.9" step="0.05" />
              <label class="number-wrap">
                <input
                  v-model.number="bodyLineHeightMultiplier"
                  type="number"
                  min="1.35"
                  max="1.9"
                  step="0.05"
                  class="number-input"
                />
                <span>x</span>
              </label>
            </div>
          </label>
        </div>
      </aside>

      <section class="panel summary-panel">
        <div class="section-heading">
          <h3>布局摘要</h3>
          <p>每张卡片会先分别 prepare 标题和摘要，再根据列宽做 layout，并把预测高度直接投喂给分栏算法。</p>
        </div>

        <div class="summary-context">
          <span>{{ activeDataset.label }}</span>
          <span>{{ layoutBatch.columnCount }} 列</span>
          <span>{{ formatPx(layoutBatch.columnWidth) }} / 列</span>
          <span>{{ formatPx(layoutBatch.textWidth) }} 文本区</span>
          <span>预览缩放 {{ Math.round(previewScale * 100) }}%</span>
        </div>

        <div class="summary-grid">
          <article class="summary-card">
            <span>卡片数</span>
            <strong>{{ layoutBatch.cards.length }}</strong>
          </article>
          <article class="summary-card">
            <span>prepare</span>
            <strong>{{ preparedBatch.durationMs.toFixed(3) }}ms</strong>
          </article>
          <article class="summary-card">
            <span>layout</span>
            <strong>{{ layoutBatch.durationMs.toFixed(3) }}ms</strong>
          </article>
          <article class="summary-card">
            <span>画布高</span>
            <strong>{{ formatPx(renderBatch.contentHeight) }}</strong>
          </article>
          <article class="summary-card accent-card">
            <span>最高列</span>
            <strong>{{ formatPx(renderBatch.tallestColumnHeight) }}</strong>
          </article>
          <article class="summary-card">
            <span>总误差</span>
            <strong>{{ formatPx(totalHeightDelta) }}</strong>
          </article>
        </div>

        <div class="insight-row">
          <div class="insight-card">
            <h4>分栏热路径</h4>
            <p>只要列宽、间距或字号发生变化，就可以复用 prepared 结果重算每张卡片高度，并立刻更新列位分配。</p>
          </div>
          <div class="insight-card">
            <h4>为什么这是高级示例</h4>
            <p>这里展示的不只是单块文本高度，而是整组卡片如何在进入 DOM 之前就完成空间预算和布局决策。</p>
          </div>
        </div>

        <div v-if="selectedCard" class="inspector-card">
          <div class="inspector-header">
            <div>
              <span class="inspector-kicker">Card Inspector</span>
              <h4>{{ selectedCard.category }} / {{ selectedCard.id }}</h4>
            </div>

            <button type="button" class="reset-button" @click="resetSelectedOverrides">
              重置当前卡片
            </button>
          </div>

          <p class="inspector-description">点击左侧预测卡片或右侧实际卡片可切换当前检查对象。这里的编辑会真实改变当前卡片的内容与内部扩展区，而不只是改布局预算。</p>

          <div class="inspector-meta">
            <span>预测列 {{ selectedCard.predictedColumnIndex + 1 }}</span>
            <span>实际列 {{ selectedCard.columnIndex + 1 }}</span>
            <span>受影响卡片 {{ impactedCardIds.size }}</span>
          </div>

          <label class="field inspector-field">
            <span class="field-label">卡片标题</span>
            <input v-model="selectedTitleText" type="text" class="text-input" />
          </label>

          <label class="field inspector-field">
            <span class="field-label">卡片摘要</span>
            <textarea v-model="selectedExcerptText" rows="4" class="textarea-input" />
          </label>

          <label class="field inspector-field">
            <span class="field-label">附加内容高度</span>
            <div class="range-row">
              <input v-model.number="selectedExtraHeight" type="range" min="0" max="260" step="5" />
              <label class="number-wrap">
                <input v-model.number="selectedExtraHeight" type="number" min="0" max="260" step="5" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <div class="inspector-stats">
            <article>
              <span>基础预测高</span>
              <strong>{{ formatPx(selectedCard.basePredictedHeight) }}</strong>
            </article>
            <article>
              <span>当前预测高</span>
              <strong>{{ formatPx(selectedCard.predictedHeight) }}</strong>
            </article>
            <article>
              <span>实测高</span>
              <strong>{{ formatPx(selectedCard.actualHeight ?? selectedCard.predictedHeight) }}</strong>
            </article>
            <article>
              <span>附加内容</span>
              <strong>{{ formatPx(selectedExtraHeight) }}</strong>
            </article>
          </div>
        </div>
      </section>
    </section>

    <section class="comparison-grid">
      <article class="panel prediction-panel">
        <header class="panel-header">
          <div>
            <h3>卡片预测表</h3>
            <p>左侧清单展示每张卡片的标题高度、摘要高度、总预测高度以及最终落入的列号与纵向偏移。</p>
          </div>

          <div class="header-badges">
            <span>{{ layoutBatch.columnCount }} columns</span>
            <span>gap {{ formatPx(columnGap) }}</span>
          </div>
        </header>

        <div class="prediction-list">
          <article
            v-for="(card, index) in decoratedCards"
            :key="card.id"
            class="prediction-row"
            :class="{ selected: card.isSelected, impacted: card.isImpacted }"
            @click="selectedCardId = card.id"
          >
            <div class="prediction-index">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
            </div>

            <div class="prediction-body">
              <div class="prediction-copy">
                <div class="prediction-meta">
                  <strong>{{ card.category }}</strong>
                  <span>第 {{ card.predictedColumnIndex + 1 }} 列</span>
                  <span>Y {{ formatPx(card.predictedY) }}</span>
                </div>
                <h4>{{ card.title }}</h4>
                <p>{{ card.excerpt }}</p>
              </div>

              <dl class="prediction-stats">
                <div>
                  <dt>标题高</dt>
                  <dd>{{ formatPx(card.titleHeight) }}</dd>
                </div>
                <div>
                  <dt>摘要高</dt>
                  <dd>{{ formatPx(card.bodyHeight) }}</dd>
                </div>
                <div>
                  <dt>预测总高</dt>
                  <dd>{{ formatPx(card.predictedHeight) }}</dd>
                </div>
                <div>
                  <dt>列宽</dt>
                  <dd>{{ formatPx(layoutBatch.columnWidth) }}</dd>
                </div>
                <div>
                  <dt>实测差值</dt>
                  <dd :class="deltaClass(card.heightDelta)">{{ formatDelta(card.heightDelta) }}</dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </article>

      <article class="panel render-panel">
        <header class="panel-header render-header">
          <div>
            <h3>实际卡片流</h3>
            <p>右侧按预测高度先完成列位摆放，再直接渲染卡片。误差足够小时，就不需要渲染后再回头量高度。</p>
          </div>

          <div class="header-badges">
            <span>{{ formatPx(boardWidth) }} board</span>
            <span>{{ layoutBatch.columnCount }} cols</span>
          </div>
        </header>

        <div class="render-toolbar">
          <span>title {{ titleFont }}</span>
          <span>body {{ bodyFont }}</span>
          <span>padding {{ formatPx(cardPadding) }}</span>
          <span>安全摆放 {{ renderModeLabel }}</span>
        </div>

        <div class="render-stage-shell">
          <div
            :ref="setRenderViewportRef"
            class="render-viewport"
            :style="{ height: `${previewViewportHeight}px` }"
          >
            <div
              class="render-stage-transform"
              :style="{
                width: `${boardWidth}px`,
                height: `${renderBatch.contentHeight}px`,
                transform: `translateX(-50%) scale(${previewScale})`,
              }"
            >
              <div
                class="masonry-stage"
                :style="{
                  width: `${boardWidth}px`,
                  height: `${renderBatch.contentHeight}px`,
                }"
              >
                <div
                  v-for="guide in renderBatch.columnGuides"
                  :key="guide.columnIndex"
                  class="column-guide"
                  :class="{ selected: guide.columnIndex === selectedRenderColumnIndex }"
                  :style="{
                    left: `${guide.x}px`,
                    width: `${layoutBatch.columnWidth}px`,
                  }"
                />

                <article
                  v-for="card in decoratedCards"
                  :key="card.id"
                  :ref="setCardRef(card.id)"
                  class="masonry-card"
                  :class="{ selected: card.isSelected, impacted: card.isImpacted }"
                  @click="selectedCardId = card.id"
                  :style="{
                    left: `${card.x}px`,
                    top: `${card.y}px`,
                    width: `${layoutBatch.columnWidth}px`,
                    padding: `${cardPadding}px`,
                  }"
                >
                  <span class="card-category">{{ card.category }}</span>
                  <h4
                    class="card-title"
                    :style="{
                      font: titleFont,
                      lineHeight: `${layoutBatch.titleLineHeightPx}px`,
                      marginTop: `${layoutConstants.badgeGap}px`,
                    }"
                  >
                    {{ card.title }}
                  </h4>
                  <p
                    class="card-excerpt"
                    :style="{
                      font: bodyFont,
                      lineHeight: `${layoutBatch.bodyLineHeightPx}px`,
                      marginTop: `${layoutConstants.bodyGap}px`,
                    }"
                  >
                    {{ card.excerpt }}
                  </p>

                  <div
                    v-if="card.extraHeight > 0"
                    class="card-addon"
                    :style="{ height: `${card.extraHeight}px`, marginTop: `${layoutConstants.bodyGap}px` }"
                  >
                    <span class="card-addon-label">扩展内容 {{ formatPx(card.extraHeight) }}</span>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div class="render-footnote">
            <span>预览口固定，内部画布按比例缩放以避免横向滚动</span>
            <span>卡片位置优先按预测高度计算，必要时用实测高度兜底</span>
            <span>实测误差越小，越适合虚拟化和预排版</span>
          </div>
        </div>
      </article>
    </section>

    <section class="notes-grid">
      <article class="panel note-card">
        <h3>这里的 prepare 做了什么</h3>
        <p>每张卡片的标题和摘要分别 prepare，一次拿到后续多轮 layout 都会复用的文本测量结果，避免在热路径里重复走 DOM 测量。</p>
      </article>

      <article class="panel note-card">
        <h3>这里的 layout 做了什么</h3>
        <p>layout 先给出每张卡片的预测高度，再把这些高度交给最短列优先的分栏逻辑，因此列重排可以和文本重排同步发生。</p>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type ComponentPublicInstance } from 'vue';
import { layout, prepare, type PreparedText } from '@chenglou/pretext';

type CardSeed = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
};

type Dataset = {
  id: string;
  label: string;
  description: string;
  cards: CardSeed[];
};

type PreparedCard = CardSeed & {
  titlePrepared: PreparedText;
  bodyPrepared: PreparedText;
};

type PositionedCard = PreparedCard & {
  titleHeight: number;
  bodyHeight: number;
  predictedHeight: number;
  extraHeight: number;
  x: number;
  y: number;
  columnIndex: number;
};

const layoutConstants = {
  badgeHeight: 30,
  badgeGap: 12,
  bodyGap: 10,
  cardBorder: 2,
} as const;

const datasets: Dataset[] = [
  {
    id: 'launch',
    label: '发布准备',
    description: '标题长短不一、摘要密度不同，适合观察产品公告卡片在不同列宽下如何自动重排。',
    cards: [
      {
        id: 'launch-1',
        category: 'Launch',
        title: '发布窗口前 24 小时，把首页 hero 文案与通知栏版本号统一',
        excerpt: '避免不同渠道出现不一致的发布信息，尤其是首屏标题、版本标签和下载入口需要保持同步。',
      },
      {
        id: 'launch-2',
        category: 'QA',
        title: '回归测试需要覆盖移动端超长标题换行',
        excerpt: '如果标题在窄列里多折了一行，卡片高度会直接影响整列后续项目的位置，必须提前预测而不是上线后补量。',
      },
      {
        id: 'launch-3',
        category: 'Docs',
        title: '安装文档补充 pnpm、npm 与 monorepo 三种接入路径',
        excerpt: '文档摘要较长时，卡片高度会明显拉开；提前测量能够让内容运营页在渲染前就完成分栏预算。',
      },
      {
        id: 'launch-4',
        category: 'Growth',
        title: '新用户教育卡片的 CTA 需要保持在首屏可见区域',
        excerpt: '如果某列因为文本高度预估不准而过高，用户第一次滚动时就会感受到信息密度失衡。',
      },
      {
        id: 'launch-5',
        category: 'Ops',
        title: '值班面板摘要要兼顾告警状态与处理建议',
        excerpt: '运营类卡片通常是标题短、摘要长，这类数据最能体现 Masonry 预排版的价值。',
      },
      {
        id: 'launch-6',
        category: 'Design',
        title: '卡片视觉层次调整为标题先吸引，再由摘要补足上下文',
        excerpt: '当标题字号和摘要字号发生变化时，只需基于 prepared 文本重新 layout，不需要把每张卡片都插入页面再测量。',
      },
    ],
  },
  {
    id: 'editorial',
    label: '内容策展',
    description: '更像杂志式内容流，适合观察中长摘要和不同卡片节奏对列高平衡的影响。',
    cards: [
      {
        id: 'editorial-1',
        category: 'Feature',
        title: '长篇专题需要在窄列里保持标题节奏，不让层级被过长的首行打散',
        excerpt: '策展页经常把长文、短讯和引导卡片混放在一起，文本高度预测是决定列平衡是否自然的关键。',
      },
      {
        id: 'editorial-2',
        category: 'Essay',
        title: '多段摘要在内容卡片里应该如何压缩成有限空间',
        excerpt: '同一份 prepared 文本在不同列宽下会得到不同高度，这正是响应式策展流需要不断重算的热路径。',
      },
      {
        id: 'editorial-3',
        category: 'News',
        title: '快讯卡片虽然短，但数量大时更依赖精确的总高度估算',
        excerpt: '当页面需要窗口化渲染时，卡片高度如果只靠估算，就会让滚动条长度和可视区域错位。',
      },
      {
        id: 'editorial-4',
        category: 'Research',
        title: '图文混合卡片的文本区通常仍然是列位分配的主导因素',
        excerpt: '即便图片尺寸固定，标题与摘要的总高度仍决定了卡片最终落在哪一列，以及下面还能容纳哪些内容块。',
      },
      {
        id: 'editorial-5',
        category: 'Guide',
        title: '阅读指南卡片要在首屏给出清晰入口，不适合被高卡片挤到过深的位置',
        excerpt: '预测高度越准确，越能在排版前就安排好整组卡片的视觉节奏和信息密度。',
      },
    ],
  },
];

const selectedDatasetId = ref<Dataset['id']>('launch');
const boardWidth = ref(1040);
const minColumnWidth = ref(260);
const columnGap = ref(16);
const cardPadding = ref(18);
const titleFontSize = ref(22);
const bodyFontSize = ref(15);
const titleLineHeightMultiplier = ref(1.2);
const bodyLineHeightMultiplier = ref(1.6);
const selectedCardId = ref('launch-1');
const extraHeightById = ref<Record<string, number>>({});
const titleOverrideById = ref<Record<string, string>>({});
const excerptOverrideById = ref<Record<string, string>>({});

const cardElements = new Map<string, HTMLDivElement>();
const actualHeights = ref<Record<string, number>>({});
const renderViewportWidth = ref(0);
let renderViewportObserver: ResizeObserver | null = null;

const activeDataset = computed(() => datasets.find((dataset) => dataset.id === selectedDatasetId.value) ?? datasets[0]!);
// 这里把当前数据集整理成按 id 索引的映射表。
// 后面检查器读取原始标题、摘要时可以直接按 id 访问，
// 避免在多个 computed 里反复遍历 cards 数组。
const activeCardById = computed(() => new Map(activeDataset.value.cards.map((card) => [card.id, card] as const)));
const titleFont = computed(() => `${titleFontSize.value}px "Georgia", "Times New Roman", serif`);
const bodyFont = computed(() => `${bodyFontSize.value}px "Helvetica Neue", Helvetica, Arial, sans-serif`);
const renderModeLabel = computed(() =>
  Object.keys(actualHeights.value).length === 0 ? '预测高度' : '预测优先 + 实测兜底',
);
// 单卡附加内容高度通过双向 computed 暴露出来，
// 这样滑杆和数字输入框都能绑定同一份状态，
// 并且始终只作用于当前选中的卡片。
const selectedExtraHeight = computed({
  get: () => extraHeightById.value[selectedCardId.value] ?? 0,
  set: (value: number) => {
    const nextValue = Math.max(0, value);
    extraHeightById.value = {
      ...extraHeightById.value,
      [selectedCardId.value]: nextValue,
    };
  },
});
// 标题覆写走同样的模式：
// 检查器改这里，页面显示、prepare 和 layout 都会同步读取到新内容。
const selectedTitleText = computed({
  get: () => titleOverrideById.value[selectedCardId.value] ?? activeCardById.value.get(selectedCardId.value)?.title ?? '',
  set: (value: string) => {
    titleOverrideById.value = {
      ...titleOverrideById.value,
      [selectedCardId.value]: value,
    };
  },
});
// 摘要覆写与标题覆写保持一致，
// 目的是让“改内容”和“看排版变化”成为同一条连续链路。
const selectedExcerptText = computed({
  get: () => excerptOverrideById.value[selectedCardId.value] ?? activeCardById.value.get(selectedCardId.value)?.excerpt ?? '',
  set: (value: string) => {
    excerptOverrideById.value = {
      ...excerptOverrideById.value,
      [selectedCardId.value]: value,
    };
  },
});

// 这里把“当前数据集原始卡片”与“用户在检查器里输入的覆写内容”合并成一份派生数据。
// 后续的 prepare、layout、实际渲染都统一读取这份 effectiveCards，
// 这样可以确保页面上看到的标题、摘要和内部附加内容，
// 与布局计算时使用的数据完全一致，避免出现“界面改了但预测还是旧值”的错位。
const effectiveCards = computed(() =>
  activeDataset.value.cards.map((card) => ({
    ...card,
    title: titleOverrideById.value[card.id] ?? card.title,
    excerpt: excerptOverrideById.value[card.id] ?? card.excerpt,
  })),
);

// 这一层负责文本预处理。
// 它只依赖卡片内容本身以及标题/正文使用的字体，不依赖列宽、间距、padding 等布局参数。
// 因此当用户只是拖动画布宽度、最小列宽或卡片间距时，
// 可以直接复用这一批 prepared 结果，而不用重新处理全部文本。
// 这是当前示例里最重要的一层缓存边界。
const preparedBatch = computed(() => {
  const start = performance.now();
  const cards: PreparedCard[] = effectiveCards.value.map((card) => ({
    ...card,
    titlePrepared: prepare(card.title, titleFont.value),
    bodyPrepared: prepare(card.excerpt, bodyFont.value),
  }));
  const durationMs = performance.now() - start;

  return {
    cards,
    durationMs,
  };
});

// 这里专门判断“当前是否真的存在单卡额外高度扰动”。
// 后面的基线布局计算、受影响卡片比对都会用到这个结果，
// 先做一次集中判断可以避免重复扫描同一份状态。
const hasExtraHeightOverrides = computed(() => Object.values(extraHeightById.value).some((value) => (value ?? 0) > 0));

// 这一层负责把预处理后的文本映射成“当前参数下的预测卡片高度和预测列位”。
// 列宽、gap、padding、行高倍率等变化，都会落在这一层重新计算；
// 但它们不会影响上面的 prepared 文本缓存。
// 这样的拆分可以让用户在频繁调整布局参数时，仍然保持较轻的计算成本。
const layoutBatch = computed(() => {
  return buildPredictedLayout(extraHeightById.value);
});

// baselineLayoutBatch 用来表示“没有单卡额外高度扰动时”的基线布局。
// 它主要服务于受影响卡片高亮：对比当前布局和基线布局，就能知道哪几张卡片被挤动了。
// 但如果当前根本没有额外高度覆写，就没有必要再额外跑一遍基线计算，
// 直接复用 layoutBatch 即可，避免一次没有意义的重复布局。
const baselineLayoutBatch = computed(() => {
  return hasExtraHeightOverrides.value ? buildPredictedLayout({}) : layoutBatch.value;
});

// renderBatch 是“实际渲染阶段”的安全摆放结果。
// 它会优先使用预测高度做排布，但如果某张卡片的真实 DOM 高度更高，
// 就会退回到实测高度，防止后续卡片被挤压后发生重叠。
// 也就是说：预测结果负责展示能力，实测结果负责兜底稳定性。
const renderBatch = computed(() => {
  const placement = computePlacement(
    layoutBatch.value.cards,
    layoutBatch.value.columnCount,
    layoutBatch.value.columnWidth,
    columnGap.value,
    (card) => Math.max(card.predictedHeight, actualHeights.value[card.id] ?? 0),
  );

  return {
    contentHeight: placement.contentHeight,
    tallestColumnHeight: placement.tallestColumnHeight,
    columnGuides: placement.columnGuides,
    cards: placement.cards,
  };
});

// 右侧预览区采用“外层视口固定、内层画布缩放”的展示方式。
// 当画布宽度大于可用面板宽度时，这里会计算一个缩放比例，
// 让整个 Masonry 画布按比例缩小到当前视口内，而不是直接出现横向滚动条。
// 这样更适合观察整体排版变化，也更接近“布局看板”的使用体验。
const previewScale = computed(() => {
  if (renderViewportWidth.value <= 0 || boardWidth.value <= 0) return 1;
  return Math.min(1, renderViewportWidth.value / boardWidth.value);
});

const previewViewportHeight = computed(() => Math.max(300, renderBatch.value.contentHeight * previewScale.value));

// 通过对比“当前布局”和“无额外高度扰动时的基线布局”，
// 找出哪些卡片因为选中卡片变高而被迫改变了列位、纵向位置或预测高度。
// 这组结果会直接驱动左侧列表和右侧舞台里的 impacted 高亮。
const impactedCardIds = computed(() => {
  if (!hasExtraHeightOverrides.value) return new Set<string>();

  const baseMap = new Map(baselineLayoutBatch.value.cards.map((card) => [card.id, card]));
  const impacted = new Set<string>();

  for (const card of layoutBatch.value.cards) {
    const baseCard = baseMap.get(card.id);
    if (!baseCard) continue;

    if (
      card.columnIndex !== baseCard.columnIndex ||
      Math.abs(card.y - baseCard.y) > 0.1 ||
      Math.abs(card.predictedHeight - baseCard.predictedHeight) > 0.1
    ) {
      impacted.add(card.id);
    }
  }

  return impacted;
});

// 把 renderBatch 里的最终摆放结果也整理成按 id 访问的映射，
// 这样 decoratedCards 在合并数据时就不需要对渲染结果做重复查找。
const renderPlacementById = computed(() => new Map(renderBatch.value.cards.map((card) => [card.id, card] as const)));

// 这里把三类信息合并成最终给模板使用的视图模型：
// 1. 预测阶段得到的卡片高度、预测列位和预测纵向位置；
// 2. 实际渲染阶段得到的安全列位与坐标；
// 3. DOM 实测高度与误差值。
// 这样左侧预测表、右侧渲染舞台、检查器面板都能共享同一份数据，
// 减少模板层的重复判断，也让“预测值”和“实际值”的对照关系更清楚。
const decoratedCards = computed(() => {
  const baseMap = new Map(baselineLayoutBatch.value.cards.map((card) => [card.id, card]));

  return layoutBatch.value.cards.map((card) => {
    const actualHeight = actualHeights.value[card.id];
    const heightDelta = actualHeight == null ? null : round1(actualHeight - card.predictedHeight);
    const renderPlacement = renderPlacementById.value.get(card.id);
    const baseCard = baseMap.get(card.id);

    return {
      ...card,
      basePredictedHeight: baseCard?.predictedHeight ?? card.predictedHeight,
      predictedY: card.y,
      predictedColumnIndex: card.columnIndex,
      x: renderPlacement?.x ?? card.x,
      y: renderPlacement?.y ?? card.y,
      columnIndex: renderPlacement?.columnIndex ?? card.columnIndex,
      actualHeight,
      heightDelta,
      isSelected: card.id === selectedCardId.value,
      isImpacted: impactedCardIds.value.has(card.id),
    };
  });
});

const selectedCard = computed(() => decoratedCards.value.find((card) => card.id === selectedCardId.value) ?? decoratedCards.value[0] ?? null);
const selectedRenderColumnIndex = computed(() => selectedCard.value?.columnIndex ?? null);
const totalHeightDelta = computed(() =>
  decoratedCards.value.reduce((sum, card) => sum + Math.abs(card.heightDelta ?? 0), 0),
);

function buildPredictedLayout(extraHeights: Record<string, number>) {
  const titleLineHeightPx = titleFontSize.value * titleLineHeightMultiplier.value;
  const bodyLineHeightPx = bodyFontSize.value * bodyLineHeightMultiplier.value;
  const columnCount = Math.max(1, Math.floor((boardWidth.value + columnGap.value) / (minColumnWidth.value + columnGap.value)));
  const columnWidth = Math.max(220, (boardWidth.value - columnGap.value * (columnCount - 1)) / columnCount);
  const textWidth = Math.max(80, columnWidth - cardPadding.value * 2 - layoutConstants.cardBorder);

  const start = performance.now();
  // 这里先把每张卡片的标题和摘要高度测出来，再去做分栏摆放。
  // 原因是 Masonry 的列分配需要一个明确的卡片高度作为输入，
  // 否则就只能等卡片先进入 DOM、再回头量高度、再重新排版。
  // 当前示例要展示的核心能力正是：在进入 DOM 之前就把高度预测出来。
  const measuredCards: Array<PreparedCard & { titleHeight: number; bodyHeight: number; predictedHeight: number; extraHeight: number }> =
    preparedBatch.value.cards.map((card) => {
    const titleHeight = layout(card.titlePrepared, textWidth, titleLineHeightPx).height;
    const bodyHeight = layout(card.bodyPrepared, textWidth, bodyLineHeightPx).height;
    const extraHeight = Math.max(0, extraHeights[card.id] ?? 0);
    const predictedHeight =
      cardPadding.value * 2 +
      layoutConstants.badgeHeight +
      layoutConstants.badgeGap +
      titleHeight +
      layoutConstants.bodyGap +
      bodyHeight +
      extraHeight +
      layoutConstants.cardBorder;

    return {
      ...card,
      titleHeight,
      bodyHeight,
      predictedHeight,
      extraHeight,
    };
    });

  const placement = computePlacement(measuredCards, columnCount, columnWidth, columnGap.value, (card) => card.predictedHeight);
  const cards: PositionedCard[] = measuredCards.map((card, index) => ({
    ...card,
    ...placement.cards[index]!,
  }));
  const durationMs = performance.now() - start;

  return {
    cards,
    durationMs,
    columnCount,
    columnWidth,
    textWidth,
    titleLineHeightPx,
    bodyLineHeightPx,
    columnGuides: placement.columnGuides,
    tallestColumnHeight: placement.tallestColumnHeight,
    contentHeight: placement.contentHeight,
  };
}

function setCardRef(id: string) {
  return (element: Element | ComponentPublicInstance | null) => {
    if (element instanceof HTMLDivElement) {
      cardElements.set(id, element);
    } else {
      cardElements.delete(id);
    }
  };
}

function setRenderViewportRef(element: Element | ComponentPublicInstance | null) {
  // 这里把右侧预览容器接入 ResizeObserver。
  // 只要容器宽度变化，就把最新宽度写回响应式状态，
  // 让 previewScale 自动重新计算，从而驱动内部画布等比缩放。
  if (renderViewportObserver) {
    renderViewportObserver.disconnect();
    renderViewportObserver = null;
  }

  if (!(element instanceof HTMLDivElement) || typeof ResizeObserver === 'undefined') {
    renderViewportWidth.value = 0;
    return;
  }

  renderViewportWidth.value = element.clientWidth;
  renderViewportObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    renderViewportWidth.value = entry.contentRect.width;
  });
  renderViewportObserver.observe(element);
}

async function syncActualHeights() {
  await nextTick();

  const nextHeights: Record<string, number> = {};
  const scale = previewScale.value || 1;
  for (const [id, element] of cardElements.entries()) {
    // 右侧舞台有可能为了适配面板宽度而被整体缩放过，
    // 这时 getBoundingClientRect 读到的是“缩放后的视觉高度”，
    // 不能直接拿去和预测高度比较。
    // 因此这里要除以当前缩放比例，把数值还原回画布坐标系中的真实高度。
    nextHeights[id] = round1(element.getBoundingClientRect().height / scale);
  }

  actualHeights.value = nextHeights;
}

watch([layoutBatch, previewScale], () => {
  // 布局参数变化会影响卡片预测高度，
  // 缩放比例变化会影响当前读取到的视觉高度。
  // 两者任意一个变化，都要在下一轮 DOM 更新后重新同步实测结果。
  void syncActualHeights();
}, { immediate: true });

watch(activeDataset, (dataset) => {
  // 切换数据集后，如果原先选中的卡片已经不在新数据集中，
  // 就自动把焦点切到第一张卡片，避免检查器引用失效。
  if (!dataset.cards.some((card) => card.id === selectedCardId.value)) {
    selectedCardId.value = dataset.cards[0]?.id ?? '';
  }
}, { immediate: true });

onBeforeUnmount(() => {
  renderViewportObserver?.disconnect();
});

function computePlacement<T extends { id: string }>(
  cards: T[],
  columnCount: number,
  columnWidth: number,
  gap: number,
  getHeight: (card: T) => number,
) {
  const columnHeights = new Array<number>(columnCount).fill(0);
  const placedCards = cards.map((card) => {
    // 这里故意使用“当前最短列优先”的简单启发式算法。
    // 这样做不是因为它一定最优，而是因为示例重点在于展示：
    // 文本高度一旦可预测，列分配就可以在进入 DOM 之前提前完成。
    // 用一个足够直观的策略，更方便观察单卡扰动如何影响整页排版。
    let shortestColumn = 0;
    for (let index = 1; index < columnHeights.length; index++) {
      if (columnHeights[index]! < columnHeights[shortestColumn]!) shortestColumn = index;
    }

    const x = shortestColumn * (columnWidth + gap);
    const y = columnHeights[shortestColumn]!;
    const safeHeight = Math.max(getHeight(card), 0);
    columnHeights[shortestColumn]! += safeHeight + gap;

    return {
      id: card.id,
      x,
      y,
      columnIndex: shortestColumn,
    };
  });

  const normalizedColumnHeights = columnHeights.map((height) => Math.max(0, height - gap));
  const tallestColumnHeight = normalizedColumnHeights.length > 0 ? Math.max(...normalizedColumnHeights) : 0;

  return {
    cards: placedCards,
    tallestColumnHeight,
    contentHeight: tallestColumnHeight,
    columnGuides: Array.from({ length: columnCount }, (_, columnIndex) => ({
      columnIndex,
      x: columnIndex * (columnWidth + gap),
    })),
  };
}

function formatPx(value: number) {
  return `${Math.round(value * 10) / 10}px`;
}

function formatDelta(value: number | null) {
  if (value == null) return '待测量';
  if (Math.abs(value) < 0.1) return '≈ 0px';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}px`;
}

function deltaClass(value: number | null) {
  if (value == null) return 'delta-pending';
  if (Math.abs(value) < 0.5) return 'delta-good';
  if (Math.abs(value) < 2) return 'delta-soft';
  return 'delta-warn';
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function resetSelectedOverrides() {
  // 重置时不仅清除额外高度，
  // 也把标题和摘要恢复为当前数据集里的原始值，
  // 方便用户回到基线状态继续观察扰动前后的差异。
  extraHeightById.value = {
    ...extraHeightById.value,
    [selectedCardId.value]: 0,
  };

  const activeCard = activeCardById.value.get(selectedCardId.value);
  if (!activeCard) return;

  titleOverrideById.value = {
    ...titleOverrideById.value,
    [selectedCardId.value]: activeCard.title,
  };
  excerptOverrideById.value = {
    ...excerptOverrideById.value,
    [selectedCardId.value]: activeCard.excerpt,
  };
}
</script>

<style scoped>
.masonry-demo {
  display: grid;
  gap: 18px;
}

.panel {
  border: 1px solid rgba(35, 69, 138, 0.1);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 16px 34px rgba(26, 47, 90, 0.06);
}

.top-grid {
  display: grid;
  grid-template-columns: minmax(320px, 430px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.controls-panel,
.summary-panel,
.prediction-panel,
.render-panel,
.note-card {
  padding: 20px;
}

.section-heading h3,
.panel-header h3,
.note-card h3 {
  margin: 0;
  color: #19253f;
}

.section-heading p,
.panel-header p,
.note-card p,
.field-help {
  margin: 8px 0 0;
  color: #6f7f98;
  line-height: 1.65;
}

.dataset-group {
  margin-top: 16px;
}

.dataset-row,
.summary-context,
.header-badges,
.render-toolbar,
.render-footnote {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dataset-row {
  margin-top: 10px;
}

.chip-button {
  border: 0;
  border-radius: 999px;
  padding: 9px 14px;
  background: rgba(29, 98, 216, 0.08);
  color: #1d62d8;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.chip-button.active {
  background: #1d62d8;
  color: white;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  color: #19253f;
  font-weight: 700;
}

.range-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.number-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 88px;
  padding: 6px 10px;
  border: 1px solid rgba(77, 102, 148, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  color: #6f7f98;
}

.number-input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #19253f;
  font: inherit;
  font-weight: 700;
}

.number-input:focus {
  outline: none;
}

.summary-context {
  margin-top: 14px;
}

.summary-context span,
.header-badges span,
.render-toolbar span,
.render-footnote span,
.prediction-meta span,
.card-category {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(239, 244, 255, 0.92);
  color: #55709e;
  font-size: 0.8rem;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.summary-card {
  min-height: 100%;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(245, 248, 255, 0.84);
  border: 1px solid rgba(35, 69, 138, 0.08);
}

.summary-card span {
  display: block;
  color: #6f7f98;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-card strong {
  display: block;
  margin-top: 8px;
  color: #19253f;
  font-size: 1.2rem;
}

.accent-card {
  background: linear-gradient(180deg, rgba(29, 98, 216, 0.14), rgba(255, 255, 255, 0.94));
}

.insight-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.insight-card {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px dashed rgba(35, 69, 138, 0.12);
}

.insight-card h4 {
  margin: 0 0 8px;
  color: #19253f;
}

.insight-card p {
  margin: 0;
  color: #6f7f98;
  line-height: 1.65;
}

.inspector-card {
  margin-top: 16px;
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.96), rgba(242, 238, 229, 0.88));
  border: 1px solid rgba(35, 69, 138, 0.1);
}

.inspector-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.inspector-kicker {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(29, 98, 216, 0.1);
  color: #1d62d8;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.inspector-header h4 {
  margin: 10px 0 0;
  color: #19253f;
}

.reset-button {
  border: 0;
  border-radius: 999px;
  padding: 9px 14px;
  background: #1d62d8;
  color: white;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.inspector-description {
  margin-top: 10px;
  color: #6f7f98;
  line-height: 1.65;
}

.inspector-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.inspector-meta span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: #58729d;
  font-size: 0.8rem;
  font-weight: 700;
}

.inspector-field {
  margin-top: 14px;
}

.text-input,
.textarea-input {
  width: 100%;
  border: 1px solid rgba(77, 102, 148, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  color: #1b2946;
  font: inherit;
}

.text-input {
  padding: 11px 12px;
}

.textarea-input {
  padding: 12px 14px;
  resize: vertical;
  line-height: 1.65;
  min-height: 112px;
}

.inspector-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.inspector-stats article {
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
}

.inspector-stats span {
  display: block;
  color: #6f7f98;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.inspector-stats strong {
  display: block;
  margin-top: 8px;
  color: #19253f;
}

.comparison-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(400px, 0.96fr);
  gap: 16px;
  align-items: start;
}

.panel-header,
.render-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px;
}

.prediction-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.prediction-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid rgba(35, 69, 138, 0.08);
  background: rgba(244, 247, 254, 0.76);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.prediction-row:hover {
  transform: translateY(-2px);
}

.prediction-row.selected {
  border-color: rgba(29, 98, 216, 0.28);
  box-shadow: 0 12px 24px rgba(26, 47, 90, 0.08);
}

.prediction-row.impacted {
  background: linear-gradient(180deg, rgba(255, 239, 212, 0.82), rgba(255, 255, 255, 0.9));
}

.prediction-index span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 42px;
  padding: 0 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
  color: #365587;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.prediction-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
  gap: 14px;
}

.prediction-copy h4 {
  margin: 10px 0 0;
  color: #1b2946;
  font-size: 1.05rem;
  line-height: 1.4;
}

.prediction-copy p {
  margin: 10px 0 0;
  color: #42516d;
  line-height: 1.7;
}

.prediction-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prediction-meta strong {
  color: #19253f;
}

.prediction-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.prediction-stats div {
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
}

.prediction-stats dt {
  color: #6f7f98;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.prediction-stats dd {
  margin: 8px 0 0;
  color: #19253f;
  font-weight: 700;
}

.render-toolbar {
  margin: 14px 0 12px;
}

.render-stage-shell {
  border-radius: 22px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(247, 250, 255, 0.92), rgba(241, 236, 226, 0.84));
  border: 1px solid rgba(35, 69, 138, 0.08);
  overflow: hidden;
}

.render-viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
}

.render-stage-transform {
  position: absolute;
  top: 0;
  left: 50%;
  transform-origin: top center;
  will-change: transform;
}

.masonry-stage {
  position: relative;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(252, 253, 255, 0.98), rgba(245, 239, 229, 0.94));
  border: 1px dashed rgba(35, 69, 138, 0.14);
}

.column-guide {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(29, 98, 216, 0.03), rgba(29, 98, 216, 0.01));
}

.column-guide.selected {
  background: linear-gradient(180deg, rgba(29, 98, 216, 0.12), rgba(29, 98, 216, 0.04));
  box-shadow: inset 0 0 0 1px rgba(29, 98, 216, 0.14);
}

.masonry-card {
  position: absolute;
  box-sizing: border-box;
  border-radius: 22px;
  background: white;
  border: 1px solid rgba(25, 37, 63, 0.06);
  box-shadow: 0 12px 24px rgba(25, 37, 63, 0.06);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.masonry-card:hover {
  transform: translateY(-2px);
}

.masonry-card.selected {
  border-color: rgba(29, 98, 216, 0.28);
  box-shadow: 0 16px 28px rgba(29, 98, 216, 0.14);
}

.masonry-card.impacted {
  background: linear-gradient(180deg, rgba(255, 248, 235, 0.98), rgba(255, 255, 255, 1));
}

.card-category {
  display: inline-flex;
  align-items: center;
  height: 30px;
}

.card-title,
.card-excerpt {
  margin: 0;
  color: #1b2946;
}

.card-excerpt {
  color: #4e607d;
}

.card-addon {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 16px;
  border: 1px dashed rgba(29, 98, 216, 0.24);
  background:
    repeating-linear-gradient(
      -45deg,
      rgba(29, 98, 216, 0.08),
      rgba(29, 98, 216, 0.08) 10px,
      rgba(29, 98, 216, 0.03) 10px,
      rgba(29, 98, 216, 0.03) 20px
    );
}

.card-addon-label {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #1d62d8;
  font-size: 0.8rem;
  font-weight: 800;
}

.render-footnote {
  margin-top: 12px;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.note-card p {
  margin-top: 10px;
}

.delta-good {
  color: #2f7d32;
}

.delta-soft {
  color: #956300;
}

.delta-warn {
  color: #b23a2e;
}

.delta-pending {
  color: #6f7f98;
}

.select-input,
input[type='range'] {
  width: 100%;
}

@media (max-width: 1240px) {
  .top-grid,
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .field-grid,
  .summary-grid,
  .insight-row,
  .notes-grid,
  .prediction-body,
  .inspector-stats {
    grid-template-columns: 1fr;
  }

  .panel-header,
  .render-header,
  .inspector-header {
    align-items: start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .prediction-row {
    grid-template-columns: 1fr;
  }

  .prediction-stats {
    grid-template-columns: 1fr;
  }
}
</style>
