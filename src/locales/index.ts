import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import en from './en'

// 支持的语言列表
export const availableLocales = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
] as const

export type LocaleCode = typeof availableLocales[number]['code']

// 获取当前语言或默认语言（中文）
export const getCurrentLocale = (): LocaleCode => {
  const stored = localStorage.getItem('locale') as LocaleCode | null
  if (stored && availableLocales.some(loc => loc.code === stored)) {
    return stored
  }
  // 检测浏览器语言
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en'
}

// 创建i18n实例
export const i18n = createI18n({
  legacy: false, // 使用Composition API模式
  locale: getCurrentLocale(),
  fallbackLocale: 'en', // 回退语言
  messages: {
    'zh-CN': zhCN,
    en: en
  }
})

// 导出useI18n
export { useI18n } from 'vue-i18n'

// 语言切换函数
export const setLocale = (locale: LocaleCode) => {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  // 如果需要，可以在这里更新HTML的lang属性
  document.documentElement.lang = locale
}