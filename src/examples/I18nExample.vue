<template>
  <div class="i18n-example">
    <h1>{{ $t('messages.welcome') }} 国际化示例</h1>

    <div class="card">
      <h2>基本用法</h2>
      <p>当前语言: {{ currentLocale.flag }} {{ currentLocale.name }}</p>
      <p>{{ $t('common.loading') }}</p>
      <el-button @click="showMessage">{{ $t('common.ok') }}</el-button>
    </div>

    <div class="card">
      <h2>格式化消息</h2>
      <p>{{ $t('messages.welcome', { name: 'PreTeXt' }) }}</p>
      <p>计数器: {{ count }}</p>
      <button @click="incrementCount">{{ $t('common.add') }}</button>
    </div>

    <div class="card">
      <h2>列表渲染</h2>
      <ul>
        <li v-for="item in items" :key="item">
          {{ $t(`nav.${item}`) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n, availableLocales } from '@/locales'

const { t, locale } = useI18n()
const count = ref(0)

// 计算当前语言
const currentLocale = computed(() => {
  return availableLocales.find(loc => loc.code === locale.value) || availableLocales[0]
})

// 增加计数器
const incrementCount = () => {
  count.value++
}

// 显示消息
const showMessage = () => {
  alert(t('messages.success'))
}

// 导航项
const items = ['home', 'examples', 'documentation']
</script>

<style scoped>
.i18n-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

h2 {
  color: #34495e;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

li:last-child {
  border-bottom: none;
}

button {
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #357abd;
}
</style>