<template>
  <div class="control-panel">
    <h3>龙形文本配置</h3>

    <div class="collapsible-section">
      <div class="section-header" @click="toggleBasicConfig">
        <span class="section-title">基本配置</span>
        <span class="section-toggle">{{ showBasicConfig ? "−" : "+" }}</span>
      </div>
      <div class="section-content" :class="{ collapsed: !showBasicConfig }">
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
          <input v-model.number="repulsionForce" type="range" min="50" max="100" step="1">
          <span>{{ repulsionForce }}</span>
        </div>

        <div class="config-item">
          <label>文本恢复速度</label>
          <input v-model.number="recoverySpeed" type="range" min="0.001" max="0.2" step="0.001">
          <span>{{ recoverySpeed }}</span>
        </div>

        <div class="config-item">
          <label>颜色效果强度</label>
          <input v-model.number="colorEffectIntensity" type="range" min="0" max="5" step="0.1">
          <span>{{ colorEffectIntensity }}</span>
        </div>

        <div class="config-item">
          <label>文本颜色回调速度</label>
          <input v-model.number="colorReturnSpeed" type="range" min="0" max="1" step="0.01">
          <span>{{ colorReturnSpeed.toFixed(2) }}</span>
        </div>

        <div class="config-item">
          <label>自动移动</label>
          <label class="config-toggle">
            <input v-model="autoMoveEnabled" type="checkbox">
            <span>启用自动移动</span>
          </label>
        </div>

        <div class="config-item">
          <label>自动移动速度</label>
          <input v-model.number="autoMoveSpeed" type="range" min="1" max="100" step="0.5">
          <span>{{ autoMoveSpeed }}</span>
        </div>
      </div>
    </div>

    <div class="ornament-panel" :class="{ collapsed: !showOrnamentPanel }">
      <div class="ornament-header" @click="toggleOrnamentPanel">
        <h4>饰品栏</h4>
        <span class="ornament-toggle">{{ showOrnamentPanel ? "−" : "+" }}</span>
      </div>

      <div class="ornament-grid">
        <div class="ornament-section">
          <h5>翅膀</h5>
          <div class="config-item">
            <label>文本</label>
            <input v-model="wingDecorationText" type="text" maxlength="8">
          </div>
          <div class="config-item">
            <label>展开角</label>
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
            <label>展开角</label>
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
            <label>展开角</label>
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
import { ref } from "vue";

const showBasicConfig = ref(true);
const showOrnamentPanel = ref(false);

const toggleBasicConfig = () => {
  showBasicConfig.value = !showBasicConfig.value;
};

const toggleOrnamentPanel = () => {
  showOrnamentPanel.value = !showOrnamentPanel.value;
};

const dragonTextContent = defineModel<string>("dragonTextContent", { required: true });
const dragonSpeed = defineModel<number>("dragonSpeed", { required: true });
const baseSwingAmplitude = defineModel<number>("baseSwingAmplitude", { required: true });
const repulsionForce = defineModel<number>("repulsionForce", { required: true });
const recoverySpeed = defineModel<number>("recoverySpeed", { required: true });
const colorEffectIntensity = defineModel<number>("colorEffectIntensity", { required: true });
const colorReturnSpeed = defineModel<number>("colorReturnSpeed", { required: true });
const wingDecorationText = defineModel<string>("wingDecorationText", { required: true });
const limbDecorationText = defineModel<string>("limbDecorationText", { required: true });
const hornDecorationText = defineModel<string>("hornDecorationText", { required: true });
const wingOpenAngle = defineModel<number>("wingOpenAngle", { required: true });
const limbOpenAngle = defineModel<number>("limbOpenAngle", { required: true });
const hornOpenAngle = defineModel<number>("hornOpenAngle", { required: true });
const wingDecorationSize = defineModel<number>("wingDecorationSize", { required: true });
const limbDecorationSize = defineModel<number>("limbDecorationSize", { required: true });
const hornDecorationSize = defineModel<number>("hornDecorationSize", { required: true });
const wingDecorationSpacing = defineModel<number>("wingDecorationSpacing", { required: true });
const limbDecorationSpacing = defineModel<number>("limbDecorationSpacing", { required: true });
const hornDecorationSpacing = defineModel<number>("hornDecorationSpacing", { required: true });
const wingFlapAmplitude = defineModel<number>("wingFlapAmplitude", { required: true });
const wingFlapSpeed = defineModel<number>("wingFlapSpeed", { required: true });
const ornamentSwayAmplitude = defineModel<number>("ornamentSwayAmplitude", { required: true });
const ornamentSwaySpeed = defineModel<number>("ornamentSwaySpeed", { required: true });
const customText = defineModel<string>("customText", { required: true });
const autoMoveEnabled = defineModel<boolean>("autoMoveEnabled", { required: true });
const autoMoveSpeed = defineModel<number>("autoMoveSpeed", { required: true });
</script>

<style scoped>
.control-panel {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.collapsible-section {
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.section-header:hover {
  background-color: #dcdcdc;
}

.section-title {
  font-weight: bold;
  color: #555;
}

.section-toggle {
  font-size: 20px;
  font-weight: bold;
  color: #666;
  transition: transform 0.3s ease;
}

.section-content {
  transition: all 0.3s ease;
  overflow: hidden;
}

.section-content.collapsed {
  max-height: 0;
  padding: 0 15px;
  opacity: 0;
}

.section-content:not(.collapsed) {
  max-height: 1000px;
  padding: 15px;
  opacity: 1;
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

.config-item input[type="range"] {
  width: 100%;
  margin-bottom: 5px;
}

.config-item input[type="text"] {
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
  cursor: pointer;
}

.config-toggle input[type="checkbox"] {
  cursor: pointer;
}

.ornament-panel {
  margin-top: 18px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 249, 240, 0.95), rgba(248, 240, 229, 0.92));
  border: 1px solid rgba(213, 184, 151, 0.7);
  transition: all 0.3s ease;
  overflow: hidden;
}

.ornament-panel.collapsed {
  padding: 0;
}

.ornament-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.ornament-header:hover {
  background-color: rgba(255, 249, 240, 0.8);
}

.ornament-header h4 {
  margin: 0;
  color: #6d3e1d;
}

.ornament-toggle {
  font-size: 20px;
  font-weight: bold;
  color: #6d3e1d;
  transition: transform 0.3s ease;
}

.ornament-panel.collapsed .ornament-toggle {
  transform: rotate(0deg);
}

.ornament-panel:not(.collapsed) .ornament-toggle {
  transform: rotate(180deg);
}

.ornament-panel .ornament-grid {
  transition: all 0.3s ease;
}

.ornament-panel.collapsed .ornament-grid {
  max-height: 0;
  opacity: 0;
  padding: 0 16px;
}

.ornament-panel:not(.collapsed) .ornament-grid {
  max-height: 1000px;
  opacity: 1;
  padding: 0 16px 16px;
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
