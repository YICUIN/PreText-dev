// 基础二维点，用于轨迹采样、碰撞计算和位置插值。
export type Point = {
  x: number;
  y: number;
};

// 龙身单段的运行时状态。
export type DragonSegment = {
  x: number;
  y: number;
  char: string;
  angle: number;
};

// 装饰字符的最终渲染数据。
export type DragonDecoration = {
  id: string;
  kind: "wing" | "limb" | "horn";
  side: "left" | "right";
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

// 文本字符的物理与颜色状态。
export type TextCharState = {
  originalX: number;
  originalY: number;
  currentX: number;
  currentY: number;
  velocityX: number;
  velocityY: number;
  isColliding: boolean;
  colorBaseHue: number;
  currentHue: number;
  targetHue: number;
  colorStrength: number;
  targetColorStrength: number;
  colorVelocity: number;
};