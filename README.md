# PreTeXt Showcase (Vue + Vite)

这是一个用于展示 **PreTeXt 使用方式、API 说明与示例实践** 的站点项目。
本项目估摸着90%由AI构成

## 技术栈与版本要求

- **Node.js**: >= 16.0.0 (推荐 >= 18.0.0)
- **npm**: >= 8.0.0 (推荐 >= 8.19.0)
- **Vue**: 3.5.32
- **Vite**: 8.0.4
- **TypeScript**: ~6.0.2

### 核心依赖
- **PreTeXt**: @chenglou/pretext ^0.0.4
- **Vue i18n**: ^10.0.7
- **Vue Router**: ^4.6.4

### 开发依赖
- **Vue TSC**: ^3.2.6
- **Vite Vue Plugin**: ^6.0.5
- **@types/node**: ^24.12.2

## 你可以在这里看到什么
- 产品化首页：解释 PreTeXt 的定位与价值。
- 文档页：按 **安装 / 快速开始 / API / 示例** 组织。
- 示例页：基础、高级与创意 Playground。
- 高级 Playground：可视化调参，观察文本布局与交互行为。

## 安装与开发

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

### 类型检查
```bash
npx vue-tsc -b
```

## 开发命令

## 项目目录说明（当前）
```text
src/
  views/                         # 首页、文档、示例入口页面
  components/                    # 演示组件与历史组件
  components/advanced-dragon-playground/
                                 # 高级 Playground 子模块（控制面板、composable、类型）
  router/                        # 路由
```

## 目录规划（展示站导向）
已经补充目录规划文档：
- `docs/PROJECT_STRUCTURE_PLAN.md`

文档包含：
- 目标目录结构
- 现有目录到目标结构的映射
- 分阶段迁移建议
- 命名规范建议

## 备注
当前环境下 `npm run build` 可能受本地 `spawn EPERM` 限制影响；代码层可先通过 `npx vue-tsc -b` 验证。
