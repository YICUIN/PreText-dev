<template>
  <div class="message-flow-demo">
    <section class="controls-grid">
      <aside class="panel controls-panel">
        <div class="section-heading">
          <h3>场景控制</h3>
          <p>这里调的是一组消息的整体排版行为，而不是单个文本块。</p>
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
            <span class="field-label">聊天区宽度</span>
            <div class="range-row">
              <input v-model.number="chatWidth" type="range" min="280" max="680" step="10" />
              <label class="number-wrap">
                <input v-model.number="chatWidth" type="number" min="280" max="680" step="10" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">字体大小</span>
            <div class="range-row">
              <input v-model.number="fontSize" type="range" min="13" max="24" step="1" />
              <label class="number-wrap">
                <input v-model.number="fontSize" type="number" min="13" max="24" step="1" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">行高倍数</span>
            <div class="range-row">
              <input v-model.number="lineHeightMultiplier" type="range" min="1.2" max="2" step="0.05" />
              <label class="number-wrap">
                <input
                  v-model.number="lineHeightMultiplier"
                  type="number"
                  min="1.2"
                  max="2"
                  step="0.05"
                  class="number-input"
                />
                <span>x</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">字体族</span>
            <select v-model="fontFamily" class="select-input">
              <option v-for="option in fontFamilyOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">水平内边距</span>
            <div class="range-row">
              <input v-model.number="paddingX" type="range" min="8" max="24" step="1" />
              <label class="number-wrap">
                <input v-model.number="paddingX" type="number" min="8" max="24" step="1" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">垂直内边距</span>
            <div class="range-row">
              <input v-model.number="paddingY" type="range" min="6" max="18" step="1" />
              <label class="number-wrap">
                <input v-model.number="paddingY" type="number" min="6" max="18" step="1" class="number-input" />
                <span>px</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">最大宽度比例</span>
            <div class="range-row">
              <input v-model.number="bubbleMaxRatio" type="range" min="0.55" max="0.88" step="0.01" />
              <label class="number-wrap">
                <input v-model.number="bubbleMaxRatio" type="number" min="0.55" max="0.88" step="0.01" class="number-input" />
                <span>x</span>
              </label>
            </div>
          </label>

          <label class="field">
            <span class="field-label">空白模式</span>
            <select v-model="whiteSpaceMode" class="select-input">
              <option value="normal">normal</option>
              <option value="pre-wrap">pre-wrap</option>
            </select>
          </label>
        </div>
      </aside>

      <section class="summary-panel panel">
        <div class="section-heading">
          <h3>核心指标</h3>
          <p>prepare 只跟文本、字体、white-space 绑定；调宽度和 padding 主要影响 layout 阶段。</p>
        </div>

        <div class="summary-context">
          <span>{{ activeDataset.label }}</span>
          <span>{{ previewFont }}</span>
          <span>{{ widthModeLabel }}</span>
        </div>

        <div class="summary-grid">
          <article class="summary-card">
            <span>消息数</span>
            <strong>{{ layoutBatch.items.length }}</strong>
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
            <span>总预测高度</span>
            <strong>{{ formatPx(layoutBatch.totalPredictedHeight) }}</strong>
          </article>
          <article class="summary-card accent-card">
            <span>可收紧面积</span>
            <strong>{{ formatSquarePx(layoutBatch.totalWastedPixels) }}</strong>
          </article>
          <article class="summary-card">
            <span>实际行高</span>
            <strong>{{ formatPx(layoutBatch.lineHeightPx) }}</strong>
          </article>
        </div>

        <div class="insight-row">
          <div class="insight-card">
            <h4>批量 prepare</h4>
            <p>当前数据集中的消息会统一预处理并缓存，后面的宽度变化会直接复用这批 prepared 结果。</p>
          </div>
          <div class="insight-card">
            <h4>紧致气泡策略</h4>
            <p>在不增加行数的前提下继续缩窄气泡宽度，用来减少空洞感并回收无效像素面积。</p>
          </div>
        </div>
      </section>
    </section>

    <section class="comparison-grid">
      <article class="panel prediction-panel">
        <header class="panel-header">
          <div>
            <h3>预测清单</h3>
            <p>每条消息在进入 DOM 之前，就已经具备行数、高度、标准宽度和紧致宽度信息。</p>
          </div>

          <div class="header-badges">
            <span>content max {{ formatPx(layoutBatch.contentMaxWidth) }}</span>
            <span>bubble max {{ formatPx(layoutBatch.bubbleMaxWidth) }}</span>
          </div>
        </header>

        <div class="prediction-list">
          <article
            v-for="(item, index) in decoratedItems"
            :key="item.id"
            class="prediction-row"
            :class="item.tone"
          >
            <div class="prediction-index">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
            </div>

            <div class="prediction-body">
              <div class="prediction-copy">
                <div class="prediction-meta">
                  <strong>{{ item.author }}</strong>
                  <span>{{ item.lineCount }} 行</span>
                  <span class="tone-badge" :class="item.tone">{{ item.tone === 'outgoing' ? '发送' : '接收' }}</span>
                </div>
                <p>{{ item.text }}</p>
              </div>

              <dl class="prediction-stats">
                <div>
                  <dt>预测高</dt>
                  <dd>{{ formatPx(item.predictedOuterHeight) }}</dd>
                </div>
                <div>
                  <dt>标准宽</dt>
                  <dd>{{ formatPx(item.standardWidth) }}</dd>
                </div>
                <div>
                  <dt>紧致宽</dt>
                  <dd>{{ formatPx(item.tightWidth) }}</dd>
                </div>
                <div>
                  <dt>节省面积</dt>
                  <dd>{{ formatSquarePx(item.wastedArea) }}</dd>
                </div>
                <div>
                  <dt>实测差值</dt>
                  <dd :class="deltaClass(item.heightDelta)">
                    {{ formatDelta(item.heightDelta) }}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </article>

      <article class="panel render-panel">
        <header class="panel-header render-header">
          <div>
            <h3>实际渲染预览</h3>
            <p>右侧聊天区使用同一套字体、line-height、padding 与 white-space 设置进行渲染。</p>
          </div>

          <div class="mode-switch">
            <button
              type="button"
              class="chip-button"
              :class="{ active: widthMode === 'standard' }"
              @click="widthMode = 'standard'"
            >
              标准宽度
            </button>
            <button
              type="button"
              class="chip-button"
              :class="{ active: widthMode === 'tight' }"
              @click="widthMode = 'tight'"
            >
              紧致宽度
            </button>
          </div>
        </header>

        <div class="render-toolbar">
          <span>聊天区 {{ formatPx(chatWidth) }}</span>
          <span>气泡模式 {{ widthModeLabel }}</span>
          <span>数据集 {{ activeDataset.label }}</span>
        </div>

        <div class="render-stage-shell">
          <div class="chat-stage">
            <div class="chat-panel" :style="{ width: `${chatWidth}px` }">
              <div
                v-for="item in decoratedItems"
                :key="item.id"
                class="bubble-row"
                :class="item.tone"
              >
                <div class="bubble-stack">
                  <span class="author-badge">{{ item.author }}</span>
                  <div
                    :ref="setBubbleRef(item.id)"
                    class="bubble"
                    :class="item.tone"
                    :style="{
                      width: `${item.renderWidth}px`,
                      padding: `${paddingY}px ${paddingX}px`,
                      font: previewFont,
                      lineHeight: `${layoutBatch.lineHeightPx}px`,
                      whiteSpace: previewWhiteSpace,
                    }"
                  >
                    {{ item.text }}
                  </div>

                  <div class="bubble-meta-row">
                    <span>{{ widthModeLabel }} {{ formatPx(item.renderWidth) }}</span>
                    <span>预测 {{ formatPx(item.predictedOuterHeight) }}</span>
                    <span>实测 {{ formatPx(item.actualHeight ?? item.predictedOuterHeight) }}</span>
                    <span :class="deltaClass(item.heightDelta)">{{ formatDelta(item.heightDelta) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="render-footnote">
            <span>左侧是提前预测出的空间预算</span>
            <span>右侧是使用同一套参数进行的实际渲染</span>
          </div>
        </div>
      </article>
    </section>

    <section class="notes-grid">
      <article class="panel note-card">
        <h3>什么时候会重新 prepare</h3>
        <p>文本内容、字体 shorthand 和 white-space 改变时，prepared 结果需要重建；当前组件把这部分与 layout 计算拆开，尽量贴近真实业务中的缓存边界。</p>
      </article>

      <article class="panel note-card">
        <h3>什么时候只需要重新 layout</h3>
        <p>聊天区宽度、行高、气泡 padding、最大宽度比例变化时，可以直接复用 prepared 结果重新算高度和气泡宽度，这正是虚拟列表和响应式面板最常见的热路径。</p>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, type ComponentPublicInstance } from 'vue';
import { layout, prepareWithSegments, walkLineRanges, type PrepareOptions, type PreparedTextWithSegments } from '@chenglou/pretext';

type WhiteSpaceMode = 'normal' | 'pre-wrap';
type WidthMode = 'standard' | 'tight';
type MessageTone = 'incoming' | 'outgoing';

type MessageSeed = {
  id: string;
  author: string;
  tone: MessageTone;
  text: string;
};

type Dataset = {
  id: string;
  label: string;
  description: string;
  messages: MessageSeed[];
};

type WrapMetrics = {
  lineCount: number;
  textHeight: number;
  maxLineWidth: number;
};

type PreparedMessage = MessageSeed & {
  prepared: PreparedTextWithSegments;
};

type LayoutMessage = PreparedMessage & {
  lineCount: number;
  predictedTextHeight: number;
  predictedOuterHeight: number;
  standardWidth: number;
  tightWidth: number;
  wastedArea: number;
};

const datasets: Dataset[] = [
  {
    id: 'product',
    label: '产品沟通',
    description: '短中句混合，适合观察常规聊天消息在不同容器宽度下的高度波动与气泡紧致程度。',
    messages: [
      { id: 'product-1', author: 'Ava', tone: 'incoming', text: '今晚把 onboarding 的提示语再缩短一点，首页首屏就能更干净。' },
      { id: 'product-2', author: 'Milo', tone: 'outgoing', text: '可以，我先把标题控制在两行以内，再用 PreTeXt 预估一下不同断点下的卡片高度。' },
      { id: 'product-3', author: 'Ava', tone: 'incoming', text: '顺便看看通知列表，长消息进来以后会不会把虚拟滚动的位置顶偏。' },
      { id: 'product-4', author: 'Milo', tone: 'outgoing', text: '这类场景很适合先 prepare，再按面板宽度反复 layout，滚动范围就能提前算出来。' },
      { id: 'product-5', author: 'Ava', tone: 'incoming', text: '那就按“预测高度 + 实际渲染对照”的方式做成高级示例。' },
    ],
  },
  {
    id: 'multilingual',
    label: '多语言混排',
    description: '英文、中文、阿拉伯语和 emoji 混合，适合观察分词与换行在真实消息流中的表现。',
    messages: [
      { id: 'multi-1', author: 'Nora', tone: 'incoming', text: 'English meets 中文 here so we can inspect line breaks without waiting for DOM measurement.' },
      { id: 'multi-2', author: 'Omar', tone: 'outgoing', text: 'العرض يتغير بسرعة، لكننا نريد أن تظل الفقاعات مستقرة حتى قبل أن تدخل قائمة الرسائل إلى DOM.' },
      { id: 'multi-3', author: 'Nora', tone: 'incoming', text: 'emoji 🚀 and 日本語も混ぜると、行数预测会更接近真实产品环境。' },
      { id: 'multi-4', author: 'Omar', tone: 'outgoing', text: 'The point is not just wrapping text. The point is knowing the height early enough to drive list layout.' },
    ],
  },
  {
    id: 'whitespace',
    label: '空白保留',
    description: '包含多空格和显式换行，适合对比 normal 与 pre-wrap 模式下同一批消息的预测结果。',
    messages: [
      { id: 'space-1', author: 'Rin', tone: 'incoming', text: '日志里这两列要对齐：\nstatus    ready\nworker    synced' },
      { id: 'space-2', author: 'Sol', tone: 'outgoing', text: '收到。\n我会保留这些空白，看看 pre-wrap 下的高度是否明显增长。' },
      { id: 'space-3', author: 'Rin', tone: 'incoming', text: '如果不用 DOM 量高度，我们也能提前知道这条消息会占多少滚动空间。' },
      { id: 'space-4', author: 'Sol', tone: 'outgoing', text: '这正是高级示例要强调的：空间预算要先于渲染，而不是滞后于渲染。  ' },
    ],
  },
];

const fontFamilyOptions = [
  { label: 'Helvetica Neue', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
];

const selectedDatasetId = ref<Dataset['id']>('product');
const chatWidth = ref(420);
const fontSize = ref(16);
const lineHeightMultiplier = ref(1.5);
const fontFamily = ref(fontFamilyOptions[0]!.value);
const paddingX = ref(14);
const paddingY = ref(10);
const bubbleMaxRatio = ref(0.76);
const whiteSpaceMode = ref<WhiteSpaceMode>('normal');
const widthMode = ref<WidthMode>('tight');

// bubbleElements 保存右侧实际渲染出来的气泡 DOM 引用，
// 后面会基于这些引用读取真实高度，用来和预测结果做对照。
const bubbleElements = new Map<string, HTMLDivElement>();
const actualHeights = ref<Record<string, number>>({});

const activeDataset = computed(() => datasets.find((dataset) => dataset.id === selectedDatasetId.value) ?? datasets[0]!);
const previewFont = computed(() => `${fontSize.value}px ${fontFamily.value}`);
const previewWhiteSpace = computed(() => whiteSpaceMode.value);
const widthModeLabel = computed(() => (widthMode.value === 'tight' ? '紧致宽度' : '标准宽度'));

// 这一层专门负责消息文本的预处理。
// 这里得到的 prepared 结果只和“文本内容、字体、white-space 模式”有关，
// 不受聊天区宽度、气泡 padding、行高等布局参数影响。
// 因此当用户只是拖动宽度或切换气泡模式时，可以直接复用这一批缓存结果，
// 避免每次交互都重新走 prepare，减少不必要的重复计算。
const preparedBatch = computed(() => {
  const options: PrepareOptions = {
    whiteSpace: whiteSpaceMode.value,
  };

  const start = performance.now();
  const items: PreparedMessage[] = activeDataset.value.messages.map((message) => ({
    ...message,
    prepared: prepareWithSegments(message.text, previewFont.value, options),
  }));
  const durationMs = performance.now() - start;

  return {
    items,
    durationMs,
  };
});

// 这一层负责真正的布局预测。
// 当宽度、padding、line-height、最大宽度比例等参数变化时，
// 只需要基于上面的 prepared 结果重新做 layout 即可，
// 不需要重新预处理文本本身。
// 这样能更直观地体现出 prepare 和 layout 的职责边界，
// 也更接近真实业务里“文本缓存 + 多次重排”的使用方式。
const layoutBatch = computed(() => {
  const lineHeightPx = fontSize.value * lineHeightMultiplier.value;
  const bubbleMaxWidth = Math.max(160, Math.floor(chatWidth.value * bubbleMaxRatio.value));
  const contentMaxWidth = Math.max(96, bubbleMaxWidth - paddingX.value * 2);

  const start = performance.now();
  const items: LayoutMessage[] = preparedBatch.value.items.map((message) => {
    const standardMetrics = collectWrapMetrics(message.prepared, contentMaxWidth, lineHeightPx);
    const tightMetrics = findTightWrapMetrics(message.prepared, contentMaxWidth, lineHeightPx);
    const standardWidth = Math.ceil(standardMetrics.maxLineWidth) + paddingX.value * 2;
    const tightWidth = Math.ceil(tightMetrics.maxLineWidth) + paddingX.value * 2;
    const predictedOuterHeight = standardMetrics.textHeight + paddingY.value * 2;
    const wastedArea = Math.max(0, standardWidth - tightWidth) * predictedOuterHeight;

    return {
      ...message,
      lineCount: standardMetrics.lineCount,
      predictedTextHeight: standardMetrics.textHeight,
      predictedOuterHeight,
      standardWidth,
      tightWidth,
      wastedArea,
    };
  });
  const durationMs = performance.now() - start;

  return {
    items,
    durationMs,
    lineHeightPx,
    bubbleMaxWidth,
    contentMaxWidth,
    totalPredictedHeight: items.reduce((sum, item) => sum + item.predictedOuterHeight, 0),
    totalWastedPixels: items.reduce((sum, item) => sum + item.wastedArea, 0),
  };
});

// 这一层把“预测结果”和“真实渲染结果”合并到一起。
// 左侧列表需要显示预测高度、右侧预览需要使用最终宽度，
// 同时页面还要展示预测值和实测值之间的偏差，
// 所以这里统一产出给模板直接消费的视图数据。
const decoratedItems = computed(() =>
  layoutBatch.value.items.map((item) => {
    const actualHeight = actualHeights.value[item.id];
    const renderWidth = widthMode.value === 'tight' ? item.tightWidth : item.standardWidth;
    const heightDelta = actualHeight == null ? null : round1(actualHeight - item.predictedOuterHeight);

    return {
      ...item,
      renderWidth,
      actualHeight,
      heightDelta,
    };
  }),
);

function collectWrapMetrics(prepared: PreparedTextWithSegments, maxWidth: number, lineHeightPx: number): WrapMetrics {
  // 这里通过 walkLineRanges 遍历每一行的断行结果，
  // 统计出总行数、文本高度，以及“最宽那一行”的宽度。
  // 后面标准气泡宽度、tight 气泡宽度和浪费面积估算，
  // 都依赖这组基础指标。
  let maxLineWidth = 0;

  const lineCount = walkLineRanges(prepared, maxWidth, (line) => {
    if (line.width > maxLineWidth) maxLineWidth = line.width;
  });

  return {
    lineCount,
    textHeight: lineCount * lineHeightPx,
    maxLineWidth,
  };
}

function findTightWrapMetrics(prepared: PreparedTextWithSegments, maxWidth: number, lineHeightPx: number): WrapMetrics {
  const initialMetrics = collectWrapMetrics(prepared, maxWidth, lineHeightPx);
  let low = 1;
  let high = Math.max(1, Math.ceil(maxWidth));

  // 这里用二分查找去寻找“最紧致气泡宽度”。
  // 目标不是单纯找到最窄宽度，而是找到“在不增加行数的前提下，仍然能够容纳当前文本”的最小宽度。
  // 这样既能保持和标准宽度相同的行数，又能减少气泡右侧的空白区域，
  // 用来展示 tight wrap 在聊天气泡场景中的实际价值。
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const lineCount = layout(prepared, mid, lineHeightPx).lineCount;

    if (lineCount <= initialMetrics.lineCount) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return collectWrapMetrics(prepared, low, lineHeightPx);
}

function setBubbleRef(id: string) {
  // 组件渲染和卸载时都会走这里，
  // 用一个按 id 存储的 Map 来维护当前可测量的气泡节点。
  // 这样后续同步实测高度时，就不需要再次查询 DOM。
  return (element: Element | ComponentPublicInstance | null) => {
    if (element instanceof HTMLDivElement) {
      bubbleElements.set(id, element);
    } else {
      bubbleElements.delete(id);
    }
  };
}

async function syncActualHeights() {
  await nextTick();

  const nextHeights: Record<string, number> = {};
  for (const [id, element] of bubbleElements.entries()) {
    // 这里读取真实 DOM 高度，用来和左侧预测结果做对照。
    // 这个实测值不会反过来驱动消息流布局，只是用于验证：
    // 当前预测的 outer height 和浏览器真实渲染结果之间是否存在明显误差。
    // 这样页面既能展示“预测值”，也能展示“预测是否可信”。
    nextHeights[id] = round1(element.getBoundingClientRect().height);
  }

  actualHeights.value = nextHeights;
}

watch([layoutBatch, widthMode], () => {
  // 只要预测布局结果发生变化，或者展示模式从 standard/tight 之间切换，
  // 就重新同步一次实测高度。
  // immediate: true 可以保证页面首次进入时也能得到首轮对照数据。
  void syncActualHeights();
}, { immediate: true });

function formatPx(value: number) {
  return `${Math.round(value * 10) / 10}px`;
}

function formatSquarePx(value: number) {
  return `${Math.round(value).toLocaleString()} px²`;
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
</script>

<style scoped>
.message-flow-demo {
  display: grid;
  gap: 18px;
}

.panel {
  border: 1px solid rgba(35, 69, 138, 0.1);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 16px 34px rgba(26, 47, 90, 0.06);
}

.controls-grid {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
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

.summary-context {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.summary-context span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(239, 244, 255, 0.92);
  color: #55709e;
  font-size: 0.8rem;
  font-weight: 700;
}

.dataset-row,
.mode-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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

.select-input,
input[type='range'] {
  width: 100%;
}

.select-input {
  border: 1px solid rgba(77, 102, 148, 0.18);
  border-radius: 16px;
  padding: 11px 12px;
  background: rgba(255, 255, 255, 0.92);
  color: #19253f;
  font: inherit;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.summary-card {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(245, 248, 255, 0.84);
  border: 1px solid rgba(35, 69, 138, 0.08);
  min-height: 100%;
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

.comparison-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
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

.header-badges,
.render-toolbar,
.bubble-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.header-badges span,
.render-toolbar span,
.bubble-meta-row span,
.author-badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(244, 247, 254, 0.92);
  color: #6f7f98;
  font-size: 0.8rem;
  font-weight: 700;
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
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.prediction-row.incoming {
  background: rgba(244, 247, 254, 0.78);
}

.prediction-row.outgoing {
  background: rgba(244, 235, 222, 0.72);
}

.prediction-copy p {
  margin: 10px 0 0;
  color: #42516d;
  line-height: 1.7;
}

.prediction-index {
  display: flex;
  align-items: flex-start;
}

.prediction-index span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 42px;
  padding: 0 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  color: #365587;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.prediction-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(250px, 340px);
  gap: 14px;
}

.prediction-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prediction-meta strong {
  color: #19253f;
}

.prediction-meta span {
  color: #6f7f98;
  font-size: 0.84rem;
  font-weight: 700;
}

.tone-badge {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
}

.tone-badge.incoming {
  color: #3d5d8f;
}

.tone-badge.outgoing {
  color: #8e5410;
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
  background: rgba(255, 255, 255, 0.74);
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
}

.chat-stage {
  overflow: auto;
  border-radius: 22px;
  padding: 18px;
  background:
    linear-gradient(180deg, rgba(250, 252, 255, 0.98), rgba(242, 238, 229, 0.94)),
    linear-gradient(90deg, rgba(29, 98, 216, 0.03), transparent 30%);
  border: 1px dashed rgba(35, 69, 138, 0.14);
}

.chat-panel {
  display: grid;
  gap: 12px;
  margin: 0 auto;
  min-height: 100%;
}

.bubble-row {
  display: flex;
}

.bubble-row.outgoing {
  justify-content: flex-end;
}

.bubble-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 100%;
}

.bubble-row.outgoing .bubble-stack {
  align-items: flex-end;
}

.bubble {
  border-radius: 22px;
  color: #19253f;
  box-sizing: border-box;
  overflow-wrap: break-word;
  box-shadow: 0 12px 24px rgba(25, 37, 63, 0.06);
  border: 1px solid rgba(25, 37, 63, 0.04);
}

.bubble.incoming {
  background: white;
}

.bubble.outgoing {
  background: linear-gradient(180deg, #ffe1b7, #ffd19c);
}

.render-footnote {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.render-footnote span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #6a7991;
  font-size: 0.8rem;
  font-weight: 700;
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

@media (max-width: 1240px) {
  .controls-grid,
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .field-grid,
  .summary-grid,
  .insight-row,
  .notes-grid,
  .prediction-body {
    grid-template-columns: 1fr;
  }

  .panel-header,
  .render-header {
    align-items: start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .prediction-stats {
    grid-template-columns: 1fr;
  }

  .prediction-row {
    grid-template-columns: 1fr;
  }

  .prediction-index {
    justify-content: flex-start;
  }
}
</style>
