<template>
  <div class="app">
    <header class="app-header">
      <!-- 导航栏 -->
      <div class="header-content">
        <!-- logo -->
        <router-link to="/" class="logo">PreTeXt</router-link>

        <!-- 导航菜单 -->
        <nav>
          <router-link to="/">{{ $t('nav.home') }}</router-link>
          <router-link to="/examples">{{ $t('nav.examples') }}</router-link>
          <router-link to="/documentation">{{ $t('nav.documentation') }}</router-link>
        </nav>

        <!-- 语言切换器 -->
        <LocaleSwitcher />
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="app-footer">
      <p>{{ $t('messages.welcome') }} PreTeXt 演示项目 &copy; 2026</p>
    </footer>
  </div>
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Arial", sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  /* sticky 头部用于保持全站导航常驻，便于在文档/示例间快速切换。 */
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  /* 内容区域限宽并两端对齐，保证大屏不拉伸、小屏不拥挤。 */
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4a90e2;
  text-decoration: none;
}

nav {
  display: flex;
  gap: 20px;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

nav a:hover {
  color: #4a90e2;
}

.app-main {
  /* 主区占满可用高度，确保 footer 始终位于页面底部。 */
  flex: 1;
}

.app-footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 移动端适当压缩间距和字号，提高导航可读性。 */
  .header-content {
    padding: 0 15px;
  }

  .logo {
    font-size: 1.2rem;
  }

  nav {
    gap: 15px;
  }

  nav a {
    font-size: 0.9rem;
  }
}
</style>

<script>
import LocaleSwitcher from '@/components/LocaleSwitcher/LocaleSwitcher.vue'

export default {
  name: 'App',
  components: {
    LocaleSwitcher
  }
}
</script>
