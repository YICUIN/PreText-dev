# PreTeXt 展示站目录规划

## 目标
- 让目录按“展示站信息架构”组织，而不是按历史实验文件堆叠。
- 区分三类内容：页面（信息架构）、演示能力（playground）、文档内容（docs/content）。
- 便于后续继续新增示例，不破坏主页/文档的清晰性。

## 建议目标结构
```text
src/
  app/
    router/
      index.ts
    layouts/
      SiteLayout.vue
  views/
    Home.vue
    Documentation.vue
    Examples.vue
  features/
    docs/
      content/
        install.md
        quick-start.md
        api.md
        examples.md
    showcase/
      basic/
        BasicExampleView.vue
      advanced/
        AdvancedExampleView.vue
      playground/
        AdvancedDragonPlayground.vue
        AdvancedDragonControls.vue
        useDragonDecorations.ts
        types.ts
  shared/
    components/
      CodeBlock.vue
      SectionCard.vue
    styles/
      tokens.css
      utilities.css
    utils/
      format.ts
```

## 当前项目到目标结构的映射建议
1. `src/router/index.ts`
   - 后续迁移到 `src/app/router/index.ts`，把路由按 `docs / examples / playground` 分组。
2. `src/views/*`
   - `Home.vue`、`Documentation.vue`、`Examples.vue` 继续保留为页面入口。
3. `src/components/advanced-dragon-playground/*`
   - 这是比较好的结构雏形，后续可整体迁移到 `src/features/showcase/playground/`。
4. `src/components/DragonPlayground.vue`、`src/components/DragonText.vue`
   - 建议放入 `src/legacy/` 或直接并入 `src/features/showcase/experimental/`，避免污染主展示路径。

## 分阶段迁移（推荐）
1. 第一阶段（已可开始）
   - 保持功能不变，仅做路径归类和命名统一。
2. 第二阶段
   - 提取通用 UI 组件（代码块、参数面板、章节容器）到 `shared/components`。
3. 第三阶段
   - 文档内容数据化（Markdown/JSON），页面只负责渲染，降低维护成本。

## 命名规范建议
- 页面组件：`PascalCase + View.vue`（例如 `DocumentationView.vue`）。
- 演示组件：`Feature + Variant + Playground.vue`。
- composable：`useXxx.ts`。
- 类型：`types.ts` 或 `xxx.types.ts`。
