<template>
  <div class="locale-switcher">
    <div class="dropdown" @click="toggleDropdown">
      <span class="current-locale">{{ currentLocale.flag }} {{ currentLocale.name }}</span>
      <span class="arrow">▼</span>
      <div class="dropdown-menu" v-show="isOpen">
        <div
          v-for="locale in availableLocales"
          :key="locale.code"
          class="dropdown-item"
          @click="handleLanguageChange(locale.code)"
        >
          {{ locale.flag }} {{ locale.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n, availableLocales, setLocale, type LocaleCode } from '@/locales'

const isOpen = ref(false)

const { locale } = useI18n()

// 计算当前语言
const currentLocale = computed(() => {
  return availableLocales.find(loc => loc.code === locale.value) || availableLocales[0]
})

// 切换下拉菜单
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// 处理语言切换
const handleLanguageChange = (locale: LocaleCode) => {
  setLocale(locale)
  isOpen.value = false
}

// 点击其他地方关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const dropdown = document.querySelector('.locale-switcher .dropdown')
  if (dropdown && !dropdown.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// 添加全局点击事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.locale-switcher {
  margin-right: 16px;
}

.dropdown {
  position: relative;
  cursor: pointer;
  user-select: none;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.3s;
}

.dropdown:hover {
  border-color: #409eff;
}

.current-locale {
  margin-right: 4px;
}

.arrow {
  font-size: 12px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 2px;
  /* 补充最低宽度，防止下拉菜单宽度被挤压，变成两行 */
  min-width: 120px;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  /* 防止下拉菜单宽度被挤压，变成两行 */
  white-space: nowrap;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-item:first-child {
  border-radius: 4px 4px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 4px 4px;
}
</style>