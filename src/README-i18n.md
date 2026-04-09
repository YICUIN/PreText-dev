# 国际化 (i18n) 使用说明

本项目已集成 Vue I18n 实现国际化功能。

## 已实现的功能

1. **多语言支持**：支持中文（zh-CN）和英文（en）
2. **语言切换器**：在顶部导航栏可以切换语言
3. **持久化**：语言选择会保存到 localStorage
4. **自动检测**：根据浏览器语言自动选择初始语言

## 目录结构

```
src/
├── locales/           # 语言文件目录
│   ├── index.ts       # i18n 配置
│   ├── zh-CN.ts       # 中文翻译
│   └── en.ts          # 英文翻译
└── components/
    └── LocaleSwitcher/
        └── LocaleSwitcher.vue  # 语言切换组件
```

## 如何使用

### 1. 在组件中使用翻译

```vue
<script setup lang="ts">
import { useI18n } from '@/locales'

const { t } = useI18n()

// 使用翻译
console.log(t('nav.home'))  // 首页/Home
</script>

<template>
  <h1>{{ t('nav.home') }}</h1>
  <button>{{ t('common.save') }}</button>
</template>
```

### 2. 添加新的翻译键

在 `src/locales/zh-CN.ts` 和 `src/locales/en.ts` 中添加：

```typescript
export default {
  yourKey: '你的翻译',
  // ...
}
```

然后在组件中使用：
```vue
{{ t('yourKey') }}
```

### 3. 添加新的语言

1. 在 `src/locales/` 创建新的语言文件（如 `ja.ts`）
2. 在 `src/locales/index.ts` 中添加新语言
3. 更新 `availableLocales` 数组

### 4. 语言切换

使用 `setLocale` 函数切换语言：
```typescript
import { setLocale } from '@/locales'

// 切换到英文
setLocale('en')
```

## 示例代码

查看 `src/examples/I18nExample.vue` 了解更多用法。

## 注意事项

1. 所有翻译键必须在所有语言文件中存在
2. 使用 Composition API 时必须调用 `useI18n()`
3. 语言切换后会自动更新界面文本
4. 建议使用命名空间（如 `nav.title`）来组织翻译键