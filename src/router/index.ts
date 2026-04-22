// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

// 路由表按“站点信息架构”组织：
// Home -> 文档 -> 示例 -> 专项 Playground
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/examples',
    name: 'Examples',
    component: () => import('../views/Examples.vue')
  },
  {
    path: '/examples/basic',
    name: 'BasicExample',
    component: () => import('../views/BasicMeasurementExample.vue')
  },
  {
    path: '/examples/advanced',
    name: 'AdvancedExample',
    component: () => import('../views/AdvancedExample.vue')
  },
  {
    path: '/examples/creative',
    name: 'CreativeExample',
    component: () => import('../views/CreativeExample.vue')
  },
  {
    path: '/documentation',
    name: 'Documentation',
    component: () => import('../views/Documentation.vue')
  },
  {
    path: '/dragon-playground',
    name: 'DragonPlayground',
    component: () => import('../components/DragonPlayground.vue')
  },
  {
    path: '/advanced-dragon-playground',
    name: 'AdvancedDragonPlayground',
    component: () => import('../components/AdvancedDragonPlayground.vue')
  }
];

// 使用 HTML5 History 模式，URL 更干净（无 #）。
// 生产环境需要服务器把所有前端路由回退到 index.html。
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
