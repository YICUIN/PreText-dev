// src/examples/advanced.ts
// 高级示例数据：
// 包含样式化文本与长文本，主要用于压测和展示
// PreTeXt 在复杂输入下的稳定性与可读性。
export const advancedExamples = [
  {
    title: "带样式的文本",
    content: "PreTeXt 支持各种排版效果，包括不同字体大小和行高的组合。"
  },
  {
    title: "长文本",
    content: "PreTeXt 可以高效处理长文本，即使是非常长的文本也能保持良好的性能。".repeat(10)
  }
];
