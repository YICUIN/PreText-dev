<template>
  <div class="basic-example-page">
    <header class="topbar">
      <div class="topbar-copy">
        <span class="eyebrow">Basic Example</span>
        <h1>prepare() + layout() 最小可交互示例</h1>
        <p>
          这个示例演示的是“先预处理文本，再快速计算高度和行数”。用户可以直接调整文本、
          宽度、字体和空白策略，并立刻看到指标和预览同步变化。
        </p>
      </div>

      <details class="topbar-details">
        <summary>查看原理说明</summary>
        <div class="detail-grid">
          <article>
            <h2>示例展示什么</h2>
            <p>展示文本测量和最终渲染可以拆开处理，不必依赖反复读取 DOM 布局。</p>
          </article>
          <article>
            <h2>具体作用</h2>
            <p>适合虚拟列表高度预估、消息气泡计算、编辑器布局预测和响应式排版试算。</p>
          </article>
          <article>
            <h2>如何理解</h2>
            <p>文本、字体、空白策略影响 prepare；宽度和行高更适合基于 prepared 结果重复 layout。</p>
          </article>
        </div>
      </details>
    </header>

    <section class="workbench" aria-label="prepare 和 layout 交互工作台">
      <aside class="control-column">
        <div class="panel sticky-panel">
          <div class="panel-header compact-header">
            <h2>交互控制</h2>
            <p>保持可见，边改边看。</p>
          </div>

          <div class="control-actions">
            <button type="button" class="reset-button" @click="resetControls">
              恢复默认
            </button>
            <div class="control-status">
              <span>{{ previewFont }}</span>
              <span>实际行高 {{ measurement.lineHeightPx.toFixed(1) }}px</span>
            </div>
          </div>

          <div class="preset-row">
            <button
              v-for="preset in textPresets"
              :key="preset.label"
              type="button"
              class="preset-button"
              @click="applyPreset(preset.value)"
            >
              {{ preset.label }}
            </button>
          </div>

          <label class="field textarea-field">
            <div class="field-row">
              <span class="field-label">示例文本</span>
              <button type="button" class="toggle-button" @click="isEditorExpanded = !isEditorExpanded">
                {{ isEditorExpanded ? '收起编辑框' : '展开编辑框' }}
              </button>
            </div>
            <textarea
              v-model="text"
              class="text-input"
              :class="{ compact: !isEditorExpanded }"
              :rows="isEditorExpanded ? 11 : 5"
              spellcheck="false"
            />
          </label>

          <div class="field-grid">
            <label class="field">
              <span class="field-label">容器宽度</span>
              <div class="range-row">
                <input v-model.number="containerWidth" type="range" min="180" max="720" step="10" />
                <label class="number-input-wrap">
                  <input v-model.number="containerWidth" type="number" min="180" max="720" step="10" class="number-input" />
                  <span>px</span>
                </label>
              </div>
            </label>

            <label class="field">
              <span class="field-label">字体大小</span>
              <div class="range-row">
                <input v-model.number="fontSize" type="range" min="12" max="32" step="1" />
                <label class="number-input-wrap">
                  <input v-model.number="fontSize" type="number" min="12" max="32" step="1" class="number-input" />
                  <span>px</span>
                </label>
              </div>
            </label>

            <label class="field">
              <span class="field-label">行高倍数</span>
              <div class="range-row">
                <input v-model.number="lineHeightMultiplier" type="range" min="1" max="2.4" step="0.1" />
                <label class="number-input-wrap line-height-input-wrap">
                  <input
                    v-model.number="lineHeightMultiplier"
                    type="number"
                    min="1"
                    max="2.4"
                    step="0.1"
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

            <label class="field field-full">
              <span class="field-label">空白模式</span>
              <select v-model="whiteSpaceMode" class="select-input">
                <option value="normal">normal</option>
                <option value="pre-wrap">pre-wrap</option>
              </select>
            </label>
          </div>
        </div>
      </aside>

      <div class="result-column">
        <div class="metric-toolbar panel">
          <article class="metric-chip">
            <span class="metric-chip-label">lineCount</span>
            <strong>{{ measurement.lineCount }}</strong>
          </article>
          <article class="metric-chip">
            <span class="metric-chip-label">height</span>
            <strong>{{ measurement.height.toFixed(2) }}px</strong>
          </article>
          <article class="metric-chip">
            <span class="metric-chip-label">prepare</span>
            <strong>{{ measurement.prepareDurationMs.toFixed(3) }}ms</strong>
          </article>
          <article class="metric-chip">
            <span class="metric-chip-label">layout</span>
            <strong>{{ measurement.layoutDurationMs.toFixed(3) }}ms</strong>
          </article>
        </div>

        <div class="preview-layout">
          <section class="preview-card panel">
            <div class="panel-header compact-header">
              <h2>视觉预览</h2>
              <p>宽度变化会直接反映到文本排版上。</p>
            </div>

            <div class="preview-meta">
              <span>测量高度 {{ measurement.height.toFixed(2) }}px</span>
              <span>lineCount {{ measurement.lineCount }}</span>
              <span>{{ whiteSpaceMode }}</span>
            </div>

            <div class="preview-stage">
              <div class="preview-width-indicator">
                当前容器宽度：<strong>{{ containerWidth }}px</strong>
              </div>

              <div class="preview-canvas">
                <div class="preview-frame">
                  <div class="height-gauge" :style="{ height: `${measurement.height}px` }" aria-hidden="true">
                    <span class="height-gauge-label">{{ measurement.height.toFixed(1) }}px</span>
                  </div>

                  <div
                    class="preview-surface"
                    :style="{
                      width: `${containerWidth}px`,
                      font: previewFont,
                      lineHeight: String(lineHeightMultiplier),
                      whiteSpace: previewWhiteSpace,
                      backgroundSize: `100% ${measurement.lineHeightPx}px`,
                    }"
                  >
                    {{ text }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="side-notes">
            <div class="panel note-card">
              <h2>用户现在看到什么</h2>
              <p>左侧改参数，右侧立刻看到行数、高度和实际排版效果，不需要上下反复切屏。</p>
            </div>

            <div class="panel note-card">
              <h2>结果怎么读</h2>
              <ol class="workflow-list">
                <li>先根据文本与字体生成 prepared 数据。</li>
                <li>再按宽度与行高计算最终高度。</li>
                <li>右侧预览只负责帮助理解，核心输出仍是上方指标。</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { layout, prepare, type PrepareOptions } from '@chenglou/pretext';

type WhiteSpaceMode = 'normal' | 'pre-wrap';

type MeasurementResult = {
  lineCount: number;
  height: number;
  lineHeightPx: number;
  prepareDurationMs: number;
  layoutDurationMs: number;
};

// 默认文本同时覆盖多语言、段落换行和较长句，方便观察不同控制项对测量结果的影响。
const defaultText = `PreTeXt lets you measure multiline text before rendering it.

这段示例文本用于展示：当容器宽度、字体大小、行高和空白策略变化时，
最终的行数和高度会如何变化。你可以把这类计算结果用于虚拟列表、消息气泡、
编辑器布局预估或响应式卡片布局。`;

const textPresets = [
  { label: '默认段落', value: defaultText },
  {
    label: '多空格',
    value: 'PreTeXt    can preserve spaces.\n\n当 whiteSpace = pre-wrap 时，多个空格和换行会被保留。',
  },
  {
    label: '多语言',
    value: 'English 中文 العربية 日本語 emoji 🚀 mixed together to observe line wrapping behavior.',
  },
];

const fontFamilyOptions = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Helvetica Neue', value: '"Helvetica Neue", Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
];

const text = ref(defaultText);
const containerWidth = ref(360);
const fontSize = ref(18);
const lineHeightMultiplier = ref(1.6);
const fontFamily = ref(fontFamilyOptions[0]!.value);
const whiteSpaceMode = ref<WhiteSpaceMode>('normal');
const isEditorExpanded = ref(false);

// 测量阶段和预览阶段共用同一份 font shorthand，避免视觉样式与计算条件不一致。
const previewFont = computed(() => `${fontSize.value}px ${fontFamily.value}`);

// white-space 配置同时喂给 PreTeXt 和浏览器预览，尽量保证两边语义一致。
const previewWhiteSpace = computed(() => whiteSpaceMode.value);

const measurement = computed<MeasurementResult>(() => {
  const prepareOptions: PrepareOptions = {
    whiteSpace: whiteSpaceMode.value,
  };

  // 显式分开 prepare 和 layout 的耗时，帮助用户理解两者的职责边界。
  const prepareStart = performance.now();
  const prepared = prepare(text.value, previewFont.value, prepareOptions);
  const prepareDurationMs = performance.now() - prepareStart;

  // layout() 需要的是像素级 lineHeight，因此这里将“倍数”换算成实际像素值。
  const lineHeightPx = fontSize.value * lineHeightMultiplier.value;

  const layoutStart = performance.now();
  const layoutResult = layout(prepared, containerWidth.value, lineHeightPx);
  const layoutDurationMs = performance.now() - layoutStart;

  return {
    lineCount: layoutResult.lineCount,
    height: layoutResult.height,
    lineHeightPx,
    prepareDurationMs,
    layoutDurationMs,
  };
});

const applyPreset = (value: string) => {
  text.value = value;
};

const resetControls = () => {
  text.value = defaultText;
  containerWidth.value = 360;
  fontSize.value = 18;
  lineHeightMultiplier.value = 1.6;
  fontFamily.value = fontFamilyOptions[0]!.value;
  whiteSpaceMode.value = 'normal';
  isEditorExpanded.value = false;
};
</script>

<style scoped>
.basic-example-page {
  --page-bg: linear-gradient(180deg, #f6f1e7 0%, #fffdf8 42%, #f2ece2 100%);
  --card-bg: rgba(255, 252, 246, 0.95);
  --card-border: rgba(125, 95, 54, 0.18);
  --headline: #1f170f;
  --body: #5f5142;
  --muted: #857460;
  --accent: #b35c2e;
  --accent-soft: rgba(179, 92, 46, 0.12);
  --shadow: 0 18px 42px rgba(51, 34, 17, 0.08);
  min-height: 100%;
  padding: 24px 20px 48px;
  background:
    radial-gradient(circle at top left, rgba(179, 92, 46, 0.09), transparent 28%),
    radial-gradient(circle at 90% 8%, rgba(31, 77, 106, 0.08), transparent 22%),
    var(--page-bg);
  color: var(--body);
}

.topbar,
.workbench {
  max-width: 1580px;
  margin: 0 auto;
}

.topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 430px);
  gap: 16px;
  align-items: start;
  margin-bottom: 20px;
}

.topbar-copy,
.topbar-details,
.panel {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  box-shadow: var(--shadow);
}

.topbar-copy,
.topbar-details,
.panel {
  border-radius: 24px;
}

.topbar-copy {
  padding: 24px 26px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.topbar h1 {
  margin: 14px 0 10px;
  color: var(--headline);
  font-size: clamp(1.9rem, 3vw, 3.2rem);
  line-height: 1.05;
}

.topbar p {
  margin: 0;
  line-height: 1.7;
}

.topbar-details {
  padding: 18px 20px;
}

.topbar-details summary {
  cursor: pointer;
  color: var(--headline);
  font-weight: 700;
}

.detail-grid {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.detail-grid h2,
.panel h2 {
  margin: 0 0 8px;
  color: var(--headline);
  font-size: 1rem;
}

.workbench {
  display: grid;
  grid-template-columns: minmax(320px, 380px) minmax(0, 1.35fr);
  gap: 18px;
  align-items: start;
}

.control-column {
  min-width: 0;
}

.sticky-panel {
  position: sticky;
  top: 18px;
  padding: 20px;
}

.result-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  padding: 20px;
}

.compact-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.compact-header p {
  color: var(--muted);
  font-size: 0.95rem;
  text-align: right;
}

.control-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0 10px;
}

.reset-button {
  border: 0;
  border-radius: 999px;
  padding: 9px 14px;
  background: #1f170f;
  color: #fff9f2;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.control-status {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.control-status span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--muted);
  font-size: 0.82rem;
  font-family: "Consolas", "Courier New", monospace;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 16px 0;
}

.preset-button,
.toggle-button {
  border: 0;
  border-radius: 999px;
  padding: 9px 14px;
  background: var(--accent-soft);
  color: var(--accent);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.field,
.textarea-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.field-full {
  grid-column: 1 / -1;
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field-label {
  color: var(--headline);
  font-weight: 700;
}

.text-input,
.select-input,
input[type='range'] {
  width: 100%;
}

.text-input,
.select-input {
  border: 1px solid rgba(95, 81, 66, 0.22);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--headline);
}

.text-input {
  min-height: 220px;
  padding: 14px 16px;
  resize: vertical;
  font: 400 0.96rem/1.65 "Consolas", "Courier New", monospace;
  transition: min-height 0.2s ease;
}

.text-input.compact {
  min-height: 132px;
}

.select-input {
  padding: 11px 13px;
  font: inherit;
}

.range-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.number-input-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 88px;
  padding: 6px 10px;
  border: 1px solid rgba(95, 81, 66, 0.22);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  color: var(--muted);
}

.line-height-input-wrap {
  min-width: 96px;
}

.number-input {
  width: 100%;
  min-width: 0;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--headline);
  font: inherit;
  font-weight: 700;
}

.number-input:focus {
  outline: none;
}

.metric-toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 14px;
}

.metric-chip {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  text-align: center;
}

.metric-chip-label {
  display: block;
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.metric-chip strong {
  color: var(--headline);
  font-size: 1.15rem;
}

.preview-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.72fr);
  gap: 16px;
}

.preview-card {
  min-height: 560px;
  display: flex;
  flex-direction: column;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 12px;
}

.preview-meta span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.preview-stage {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-radius: 20px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(250, 244, 235, 0.96));
  border: 1px dashed rgba(95, 81, 66, 0.22);
}

.preview-canvas {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  min-width: max-content;
  padding: 0;
  min-height: 100%;
}

.preview-frame {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  min-width: max-content;
  min-height: 100%;
  padding: 20px 24px 20px 18px;
  border-radius: 18px;
  background: white;
  box-shadow: inset 0 0 0 1px rgba(95, 81, 66, 0.08);
}

.height-gauge {
  position: relative;
  flex: 0 0 28px;
  width: 28px;
  min-height: 32px;
  border-left: 2px dashed rgba(179, 92, 46, 0.55);
  border-top: 2px solid rgba(179, 92, 46, 0.55);
  border-bottom: 2px solid rgba(179, 92, 46, 0.55);
  pointer-events: none;
}

.height-gauge-label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.preview-width-indicator {
  margin-bottom: 16px;
  color: var(--muted);
  font-size: 0.95rem;
}

.preview-surface {
  flex: 0 0 auto;
  color: var(--headline);
  transition: width 0.18s ease;
  background-image: linear-gradient(
    180deg,
    rgba(179, 92, 46, 0.06) 0,
    rgba(179, 92, 46, 0.06) 1px,
    transparent 1px,
    transparent 100%
  );
  background-position: top left;
  background-repeat: repeat-y;
  overflow-wrap: break-word;
}

.side-notes {
  display: grid;
  gap: 16px;
}

.note-card {
  min-height: 0;
}

.workflow-list {
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
}

code {
  padding: 0.15em 0.35em;
  border-radius: 0.4em;
  background: rgba(32, 23, 14, 0.08);
  font-family: "Consolas", "Courier New", monospace;
  font-size: 0.94em;
}

@media (max-width: 1160px) {
  .workbench,
  .preview-layout,
  .topbar {
    grid-template-columns: 1fr;
  }

  .sticky-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .basic-example-page {
    padding: 16px 12px 40px;
  }

  .field-grid,
  .metric-toolbar {
    grid-template-columns: 1fr;
  }

  .compact-header,
  .field-row,
  .control-actions {
    align-items: start;
    flex-direction: column;
  }

  .control-status {
    justify-content: flex-start;
  }

  .preview-canvas {
    min-width: 0;
  }

  .preview-frame {
    gap: 14px;
    padding: 16px 16px 16px 14px;
  }

  .height-gauge-label {
    left: 10px;
    right: auto;
  }

  .preview-card {
    min-height: 440px;
  }
}
</style>
