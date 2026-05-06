# PreTeXt Showcase

一个基于 Vue 3 + Vite 搭建的 PreTeXt 展示站项目，用来集中演示：

- PreTeXt 的基础使用方式
- 文本 `prepare + layout` 的核心心智模型
- 面向真实界面的高级排版场景
- 创意型 Playground 与可视化调参体验

当前项目已经不只是一个简单的 API 试验页，而是一个面向“产品说明 + 文档 + 示例 + Playground”的展示型站点。

## 项目定位

这个项目主要回答 3 类问题：

1. `PreTeXt 是什么`
2. `PreTeXt 怎么用`
3. `PreTeXt 在真实界面里能解决什么问题`

因此项目内容被拆成了几类页面：

- 首页：用更产品化的方式介绍 PreTeXt 的定位与价值
- 文档页：整理安装、快速开始、API 与示例说明
- 示例页：从基础示例到高级示例逐步建立理解
- Playground：展示更强交互性或更偏创意的演示场景

## 当前页面结构

当前路由入口如下：

- `/`
  首页
- `/documentation`
  文档页
- `/examples`
  示例总览页
- `/examples/basic`
  基础测量示例
- `/examples/advanced`
  高级示例页
- `/examples/creative`
  创意示例页
- `/dragon-playground`
  Dragon Playground
- `/advanced-dragon-playground`
  高级 Dragon Playground

## 当前高级示例包含什么

当前高级示例页已经不是单一占位页，而是一个可扩展的案例容器，内部包含 2 个方向：

### 1. 消息流与高度预测

用于展示：

- 同一批消息如何统一 `prepare`
- 聊天区宽度变化时如何只做多次 `layout`
- 标准气泡宽度与紧致气泡宽度对照
- 预测高度与实际渲染高度对照
- 为什么这类能力适合消息流、评论流、通知列表和虚拟列表

### 2. 卡片流与预排版

用于展示：

- 先预测卡片标题与摘要高度，再进入分栏布局
- 文本高度如何驱动 Masonry 式列位分配
- 右侧舞台按可用宽度缩放预览，避免横向滚动
- 预测高度与实测高度对照
- 单卡检查器如何观察局部内容扰动对整页排版的影响

这个页面更强调“预处理结果如何服务真实界面布局”，而不是单纯调几个排版参数。

## 技术栈

### 运行环境

- Node.js `>= 16.0.0`
- 推荐 Node.js `>= 18`
- npm `>= 8`

### 核心依赖

- `vue` `^3.5.32`
- `vue-router` `^4.6.4`
- `vue-i18n` `^10.0.7`
- `@chenglou/pretext` `^0.0.4`

### 开发依赖

- `vite` `^8.0.4`
- `@vitejs/plugin-vue` `^6.0.5`
- `typescript` `~6.0.2`
- `vue-tsc` `^3.2.6`
- `@types/node` `^24.12.2`

## 启动方式

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 本地预览构建结果

```bash
npm run preview
```

## 常用开发说明

### 这个项目目前更适合看什么

- 想理解 PreTeXt 的基础用法：先看 `/documentation` 与 `/examples/basic`
- 想看更接近真实产品界面的场景：看 `/examples/advanced`
- 想看偏创意或交互的演示：看 `/examples/creative` 和 Playground

### 当前代码组织

```text
src/
  components/
    advanced-examples/            # 高级示例子案例
    advanced-dragon-playground/   # 高级 Playground 子模块
  router/                         # 路由配置
  views/                          # 首页、文档页、示例页等顶层页面

docs/
  PROJECT_STRUCTURE_PLAN.md       # 目录规划与后续演进说明
```

### 与高级示例相关的核心文件

- `src/views/AdvancedExample.vue`
  高级示例总页面与 tab 容器
- `src/components/advanced-examples/AdvancedMessageFlowExample.vue`
  消息流高度预测案例
- `src/components/advanced-examples/AdvancedMasonryExample.vue`
  卡片流预排版案例

## 当前开发状态

目前项目已经具备下面这些相对稳定的内容：

- 首页与文档页基础结构
- 基础测量示例
- 高级示例双案例结构
- Dragon Playground 与高级 Dragon Playground

同时，高级示例内部脚本已经补充了较详细的中文注释，重点解释：

- `prepare` 与 `layout` 的职责边界
- 哪些参数变化只会触发 `layout`
- 预测高度与实测高度如何对照
- 为什么需要安全摆放兜底
- 为什么单卡扰动会影响整体排版

## 后续可继续扩展的方向

- 为高级示例继续增加第三类案例，例如逐行布局分析
- 补充更系统的 README 截图或 GIF 展示
- 为文档页增加更多 API 示例与场景型说明
- 按 `docs/PROJECT_STRUCTURE_PLAN.md` 继续推进目录整理

## 备注

- 当前 README 主要面向项目开发与代码阅读
- 如果后续要对外公开展示，建议补充页面截图、示意图和更完整的使用说明

