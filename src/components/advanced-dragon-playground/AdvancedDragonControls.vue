<template>
  <div class="control-panel">
    <h3>龙形文本配置</h3>

    <div class="config-item">
      <label>龙身文本内容</label>
      <input v-model="dragonTextContent" type="text">
    </div>

    <div class="config-item">
      <label>移动速度</label>
      <input v-model.number="dragonSpeed" type="range" min="1" max="10" step="0.1">
      <span>{{ dragonSpeed }}</span>
    </div>

    <div class="config-item">
      <label>基础摆动幅度</label>
      <input v-model.number="baseSwingAmplitude" type="range" min="0" max="10" step="0.1">
      <span>{{ baseSwingAmplitude }}</span>
    </div>

    <div class="config-item">
      <label>文本排斥力度</label>
      <input v-model.number="repulsionForce" type="range" min="10" max="50" step="1">
      <span>{{ repulsionForce }}</span>
    </div>

    <div class="config-item">
      <label>文本恢复速度</label>
      <input v-model.number="recoverySpeed" type="range" min="0.01" max="0.2" step="0.01">
      <span>{{ recoverySpeed }}</span>
    </div>

    <div class="ornament-panel">
      <h4>饰品栏</h4>

      <div class="config-toggle-group">
        <label class="config-toggle">
          <input v-model="showDragonWings" type="checkbox">
          <span>翅膀</span>
        </label>
        <label class="config-toggle">
          <input v-model="showDragonLimbs" type="checkbox">
          <span>四肢</span>
        </label>
        <label class="config-toggle">
          <input v-model="showDragonHorns" type="checkbox">
          <span>龙角</span>
        </label>
      </div>

      <div class="ornament-grid">
        <div class="ornament-section">
          <h5>翅膀</h5>
          <div class="config-item">
            <label>文本</label>
            <input v-model="wingDecorationText" type="text" maxlength="8">
          </div>
          <div class="config-item">
            <label>开角</label>
            <input v-model.number="wingOpenAngle" type="range" min="10" max="85" step="1">
            <span>{{ wingOpenAngle }}°</span>
          </div>
          <div class="config-item">
            <label>大小</label>
            <input v-model.number="wingDecorationSize" type="range" min="14" max="40" step="1">
            <span>{{ wingDecorationSize }}</span>
          </div>
          <div class="config-item">
            <label>字符间距</label>
            <input v-model.number="wingDecorationSpacing" type="range" min="8" max="28" step="1">
            <span>{{ wingDecorationSpacing }}</span>
          </div>
          <div class="config-item">
            <label>摆动幅度</label>
            <input v-model.number="wingFlapAmplitude" type="range" min="0" max="24" step="0.5">
            <span>{{ wingFlapAmplitude }}°</span>
          </div>
          <div class="config-item">
            <label>摆动速度</label>
            <input v-model.number="wingFlapSpeed" type="range" min="0" max="12" step="0.2">
            <span>{{ wingFlapSpeed.toFixed(1) }}</span>
          </div>
        </div>

        <div class="ornament-section">
          <h5>四肢</h5>
          <div class="config-item">
            <label>文本</label>
            <input v-model="limbDecorationText" type="text" maxlength="8">
          </div>
          <div class="config-item">
            <label>开角</label>
            <input v-model.number="limbOpenAngle" type="range" min="10" max="80" step="1">
            <span>{{ limbOpenAngle }}°</span>
          </div>
          <div class="config-item">
            <label>大小</label>
            <input v-model.number="limbDecorationSize" type="range" min="12" max="32" step="1">
            <span>{{ limbDecorationSize }}</span>
          </div>
          <div class="config-item">
            <label>字符间距</label>
            <input v-model.number="limbDecorationSpacing" type="range" min="6" max="22" step="1">
            <span>{{ limbDecorationSpacing }}</span>
          </div>
        </div>

        <div class="ornament-section">
          <h5>龙角</h5>
          <div class="config-item">
            <label>文本</label>
            <input v-model="hornDecorationText" type="text" maxlength="8">
          </div>
          <div class="config-item">
            <label>开角</label>
            <input v-model.number="hornOpenAngle" type="range" min="8" max="70" step="1">
            <span>{{ hornOpenAngle }}°</span>
          </div>
          <div class="config-item">
            <label>大小</label>
            <input v-model.number="hornDecorationSize" type="range" min="12" max="32" step="1">
            <span>{{ hornDecorationSize }}</span>
          </div>
          <div class="config-item">
            <label>字符间距</label>
            <input v-model.number="hornDecorationSpacing" type="range" min="6" max="20" step="1">
            <span>{{ hornDecorationSpacing }}</span>
          </div>
        </div>

        <div class="ornament-section">
          <h5>统一摆动</h5>
          <div class="config-item">
            <label>饰品摆动幅度</label>
            <input v-model.number="ornamentSwayAmplitude" type="range" min="0" max="16" step="0.5">
            <span>{{ ornamentSwayAmplitude }}°</span>
          </div>
          <div class="config-item">
            <label>饰品摆动速度</label>
            <input v-model.number="ornamentSwaySpeed" type="range" min="0" max="10" step="0.2">
            <span>{{ ornamentSwaySpeed.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="text-editor">
      <h3>编辑文本</h3>
      <textarea v-model="customText" rows="5" placeholder="输入文本，每行一段"></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
// 本组件只负责“参数输入 UI”，不直接参与动画计算。
// 通过 defineModel 与父组件双向绑定，让父组件统一管理状态。
const dragonTextContent = defineModel<string>('dragonTextContent', { required: true });
const dragonSpeed = defineModel<number>('dragonSpeed', { required: true });
const baseSwingAmplitude = defineModel<number>('baseSwingAmplitude', { required: true });
const repulsionForce = defineModel<number>('repulsionForce', { required: true });
const recoverySpeed = defineModel<number>('recoverySpeed', { required: true });
const showDragonWings = defineModel<boolean>('showDragonWings', { required: true });
const showDragonLimbs = defineModel<boolean>('showDragonLimbs', { required: true });
const showDragonHorns = defineModel<boolean>('showDragonHorns', { required: true });
const wingDecorationText = defineModel<string>('wingDecorationText', { required: true });
const limbDecorationText = defineModel<string>('limbDecorationText', { required: true });
const hornDecorationText = defineModel<string>('hornDecorationText', { required: true });
const wingOpenAngle = defineModel<number>('wingOpenAngle', { required: true });
const limbOpenAngle = defineModel<number>('limbOpenAngle', { required: true });
const hornOpenAngle = defineModel<number>('hornOpenAngle', { required: true });
const wingDecorationSize = defineModel<number>('wingDecorationSize', { required: true });
const limbDecorationSize = defineModel<number>('limbDecorationSize', { required: true });
const hornDecorationSize = defineModel<number>('hornDecorationSize', { required: true });
const wingDecorationSpacing = defineModel<number>('wingDecorationSpacing', { required: true });
const limbDecorationSpacing = defineModel<number>('limbDecorationSpacing', { required: true });
const hornDecorationSpacing = defineModel<number>('hornDecorationSpacing', { required: true });
const wingFlapAmplitude = defineModel<number>('wingFlapAmplitude', { required: true });
const wingFlapSpeed = defineModel<number>('wingFlapSpeed', { required: true });
const ornamentSwayAmplitude = defineModel<number>('ornamentSwayAmplitude', { required: true });
const ornamentSwaySpeed = defineModel<number>('ornamentSwaySpeed', { required: true });
const customText = defineModel<string>('customText', { required: true });
</script>

<style scoped>
/* 控制面板采用卡片布局，保证参数区和预览区在视觉上明确分层。 */
.control-panel {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.config-item {
  margin-bottom: 15px;
}

.config-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.config-item input[type='range'] {
  width: 100%;
  margin-bottom: 5px;
}

.config-item input[type='text'] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.config-item span {
  display: inline-block;
  min-width: 48px;
  text-align: right;
  font-size: 14px;
  color: #666;
}

.config-toggle-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.config-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #ddd;
  color: #555;
  font-size: 14px;
}

.ornament-panel {
  /* 轻渐变 + 边框用于强化“这是可调参数组”的模块感。 */
  margin-top: 18px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 249, 240, 0.95), rgba(248, 240, 229, 0.92));
  border: 1px solid rgba(213, 184, 151, 0.7);
}

.ornament-panel h4,
.ornament-section h5 {
  margin: 0 0 12px;
  color: #6d3e1d;
}

.ornament-grid {
  /* 自动列宽可在桌面/平板/手机下平滑折行。 */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
}

.ornament-section {
  padding: 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.text-editor {
  margin-top: 20px;
}

.text-editor textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
}
</style>
