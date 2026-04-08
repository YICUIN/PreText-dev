// 通用二维点，用于轨迹采样、碰撞检测和插值计算。
export type Point = {
  x: number;
  y: number;
};

// 龙身单段的运行时状态：
// char 是该段显示字符，angle 决定段的朝向（用于旋转渲染）。
export type DragonSegment = {
  x: number;
  y: number;
  char: string;
  angle: number;
};

// 装饰物渲染结构：
// 这里的每一项通常对应一个“字符饰品”的最终屏幕姿态。
export type DragonDecoration = {
  id: string;
  kind: 'wing' | 'limb' | 'horn';
  side: 'left' | 'right';
  text: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  zIndex: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
  fontSize: number;
  color: string;
};

// 文本字符物理状态：
// original* 表示静态目标位，current*/velocity* 用于动态位移模拟。
export type TextCharState = {
  originalX: number;
  originalY: number;
  currentX: number;
  currentY: number;
  velocityX: number;
  velocityY: number;
  isColliding: boolean;
};
