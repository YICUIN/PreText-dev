import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { i18n } from './locales'

// 应用启动入口：
// 1) 创建 Vue 根实例
// 2) 挂载路由插件
// 3) 将应用渲染到 index.html 中的 #app
createApp(App).use(router).use(i18n).mount('#app')
