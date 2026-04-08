// src/types/pretext.d.ts
declare module 'pretext' {
  export interface TypesetOptions {
    lineHeight?: number;
    fontSize?: number;
    fontFamily?: string;
    // 其他配置选项...
  }

  export function typeset(
    text: string,
    container: HTMLElement,
    options?: TypesetOptions
  ): void;

  // 其他PreTeXt API...
}