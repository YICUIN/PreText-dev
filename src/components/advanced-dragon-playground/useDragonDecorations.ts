import { computed, type Ref } from 'vue';

import type { DragonDecoration, DragonSegment } from './types';

type DecorationOptions = {
  showDragonWings: Ref<boolean>;
  showDragonLimbs: Ref<boolean>;
  showDragonHorns: Ref<boolean>;
  wingDecorationText: Ref<string>;
  limbDecorationText: Ref<string>;
  hornDecorationText: Ref<string>;
  wingOpenAngle: Ref<number>;
  limbOpenAngle: Ref<number>;
  hornOpenAngle: Ref<number>;
  wingDecorationSize: Ref<number>;
  limbDecorationSize: Ref<number>;
  hornDecorationSize: Ref<number>;
  wingDecorationSpacing: Ref<number>;
  limbDecorationSpacing: Ref<number>;
  hornDecorationSpacing: Ref<number>;
  wingFlapAmplitude: Ref<number>;
  wingFlapSpeed: Ref<number>;
  ornamentSwayAmplitude: Ref<number>;
  ornamentSwaySpeed: Ref<number>;
};

type DecorationAnchor = {
  x: number;
  y: number;
  rotation: number;
};

type DecorationChainParams = {
  idPrefix: string;
  kind: DragonDecoration['kind'];
  side: DragonDecoration['side'];
  text: string;
  anchor: DecorationAnchor;
  openAngle: number;
  spacing: number;
  width: number;
  height: number;
  zIndex: number;
  opacity: number;
  fontSize: number;
  color: string;
  scaleY?: number;
};

// 角度与数值工具：
// - UI 上使用角度（度），计算时统一转弧度；
// - 装饰张角做上下限约束，避免出现穿模或反折。
const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const clampDecorationAngle = (angle: number) => Math.min(Math.max(angle, 0.12), Math.PI / 2 - 0.05);
const normalizeAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

// 根据“龙身某段 + 前后偏移 + 侧向偏移”计算装饰锚点。
// 这里把龙身角度当作局部坐标系，做一次 2D 旋转平移变换。
const getDecorationAnchor = (
  dragonSegments: DragonSegment[],
  segmentIndex: number,
  forwardOffset: number,
  sideOffset: number
): DecorationAnchor => {
  const clampedIndex = Math.max(0, Math.min(dragonSegments.length - 1, segmentIndex));
  const segment = dragonSegments[clampedIndex];

  if (!segment) {
    return { x: 0, y: 0, rotation: 0 };
  }

  const cos = Math.cos(segment.angle);
  const sin = Math.sin(segment.angle);

  return {
    x: segment.x + cos * forwardOffset - sin * sideOffset,
    y: segment.y + sin * forwardOffset + cos * sideOffset,
    rotation: segment.angle
  };
};

// 把一段装饰文本拆成“字符链”：
// 每个字符沿着尾向外扩展，并且角度逐字符缓慢展开，
// 这样会形成更自然的“翅膀/肢体”扇形视觉，而不是一条直线。
const createDecorationTextChain = ({
  idPrefix,
  kind,
  side,
  text,
  anchor,
  openAngle,
  spacing,
  width,
  height,
  zIndex,
  opacity,
  fontSize,
  color,
  scaleY = 1
}: DecorationChainParams): DragonDecoration[] => {
  const glyphs = Array.from(text.trim());
  if (glyphs.length === 0) {
    return [];
  }

  const tailAngle = anchor.rotation + Math.PI;
  const outwardAngle = anchor.rotation + (side === 'left' ? -Math.PI / 2 : Math.PI / 2);
  const outwardDelta = normalizeAngle(outwardAngle - tailAngle);
  const outwardSign = outwardDelta >= 0 ? 1 : -1;
  const clampedOpenAngle = clampDecorationAngle(openAngle);
  const startAngleOffset = Math.max(0.16, clampedOpenAngle * 0.38);
  const rootOffset = Math.max(3, spacing * 0.3);
  const startDirectionAngle = tailAngle + outwardSign * startAngleOffset;
  let currentX = anchor.x + Math.cos(startDirectionAngle) * rootOffset;
  let currentY = anchor.y + Math.sin(startDirectionAngle) * rootOffset;

  return glyphs.map((glyph, index) => {
    const progress = glyphs.length === 1 ? 1 : index / (glyphs.length - 1);
    const angleOffset = startAngleOffset + (clampedOpenAngle - startAngleOffset) * progress;
    const directionAngle = tailAngle + outwardSign * angleOffset;

    if (index > 0) {
      currentX += Math.cos(directionAngle) * spacing;
      currentY += Math.sin(directionAngle) * spacing;
    }

    return {
      id: `${idPrefix}-${index}`,
      kind,
      side,
      text: glyph,
      x: currentX,
      y: currentY,
      rotation: directionAngle,
      width,
      height,
      zIndex: zIndex - index,
      opacity: Math.max(0.45, opacity - index * 0.06),
      scaleX: 1,
      scaleY,
      fontSize,
      color
    };
  });
};

// 对外 composable：
// 输入龙身段位和可调参数，输出可直接渲染的装饰列表（computed）。
export const useDragonDecorations = (
  dragonSegments: Ref<DragonSegment[]>,
  animationClock: Ref<number>,
  options: DecorationOptions
) =>
  computed<DragonDecoration[]>(() => {
    if (dragonSegments.value.length === 0) {
      return [];
    }

    const decorations: DragonDecoration[] = [];
    // time 统一用秒，便于控制周期参数（速度）时更直观。
    const time = animationClock.value * 0.001;
    const bodyLength = dragonSegments.value.length;
    const ornamentSway = degreesToRadians(options.ornamentSwayAmplitude.value);
    const hornSway = Math.sin(time * options.ornamentSwaySpeed.value) * ornamentSway;
    const limbSway =
      Math.sin(time * (options.ornamentSwaySpeed.value + 0.9)) * ornamentSway * 0.8;
    const wingFlap =
      Math.sin(time * options.wingFlapSpeed.value) *
      degreesToRadians(options.wingFlapAmplitude.value);

    if (options.showDragonHorns.value) {
      // 龙角绑定头部附近段位，视觉上更稳定。
      const leftHorn = getDecorationAnchor(dragonSegments.value, 1, 12, -10);
      const rightHorn = getDecorationAnchor(dragonSegments.value, 1, 12, 10);
      decorations.push(
        ...createDecorationTextChain({
          idPrefix: 'horn-left',
          kind: 'horn',
          side: 'left',
          text: options.hornDecorationText.value,
          anchor: leftHorn,
          openAngle: degreesToRadians(options.hornOpenAngle.value) + hornSway,
          spacing: options.hornDecorationSpacing.value,
          width: options.hornDecorationSize.value + 4,
          height: options.hornDecorationSize.value + 6,
          zIndex: 14,
          opacity: 0.96,
          fontSize: options.hornDecorationSize.value,
          color: '#f4c46a'
        }),
        ...createDecorationTextChain({
          idPrefix: 'horn-right',
          kind: 'horn',
          side: 'right',
          text: options.hornDecorationText.value,
          anchor: rightHorn,
          openAngle: degreesToRadians(options.hornOpenAngle.value) + hornSway,
          spacing: options.hornDecorationSpacing.value,
          width: options.hornDecorationSize.value + 4,
          height: options.hornDecorationSize.value + 6,
          zIndex: 14,
          opacity: 0.96,
          fontSize: options.hornDecorationSize.value,
          color: '#f4c46a'
        })
      );
    }

    if (options.showDragonWings.value) {
      // 翅膀绑定前中段，避免挂在头/尾导致视觉重心失衡。
      const wingIndex = Math.max(2, Math.floor(bodyLength * 0.32));
      const leftWing = getDecorationAnchor(dragonSegments.value, wingIndex, -2, -18);
      const rightWing = getDecorationAnchor(dragonSegments.value, wingIndex, -2, 18);
      decorations.push(
        ...createDecorationTextChain({
          idPrefix: 'wing-left',
          kind: 'wing',
          side: 'left',
          text: options.wingDecorationText.value,
          anchor: leftWing,
          openAngle: degreesToRadians(options.wingOpenAngle.value) + wingFlap,
          spacing: options.wingDecorationSpacing.value,
          width: options.wingDecorationSize.value + 8,
          height: options.wingDecorationSize.value + 8,
          zIndex: 7,
          opacity: 0.88,
          fontSize: options.wingDecorationSize.value,
          color: '#d16a3a',
          scaleY: 1 + Math.abs(wingFlap) * 0.28
        }),
        ...createDecorationTextChain({
          idPrefix: 'wing-right',
          kind: 'wing',
          side: 'right',
          text: options.wingDecorationText.value,
          anchor: rightWing,
          openAngle: degreesToRadians(options.wingOpenAngle.value) + wingFlap,
          spacing: options.wingDecorationSpacing.value,
          width: options.wingDecorationSize.value + 8,
          height: options.wingDecorationSize.value + 8,
          zIndex: 7,
          opacity: 0.88,
          fontSize: options.wingDecorationSize.value,
          color: '#d16a3a',
          scaleY: 1 + Math.abs(wingFlap) * 0.28
        })
      );
    }

    if (options.showDragonLimbs.value) {
      // 四肢采用前后两组段位，且步态相位相反，形成“前后错步”。
      const limbIndexes = [
        Math.max(2, Math.floor(bodyLength * 0.22)),
        Math.max(4, Math.floor(bodyLength * 0.55))
      ];

      limbIndexes.forEach((segmentIndex, limbGroupIndex) => {
        const frontOffset = limbGroupIndex === 0 ? 8 : -4;
        const leftLimb = getDecorationAnchor(
          dragonSegments.value,
          segmentIndex,
          frontOffset,
          -14
        );
        const rightLimb = getDecorationAnchor(
          dragonSegments.value,
          segmentIndex,
          frontOffset,
          14
        );
        const gaitPhase = limbSway * (limbGroupIndex === 0 ? 1 : -1);

        decorations.push(
          ...createDecorationTextChain({
            idPrefix: `limb-left-${limbGroupIndex}`,
            kind: 'limb',
            side: 'left',
            text: options.limbDecorationText.value,
            anchor: leftLimb,
            openAngle: degreesToRadians(options.limbOpenAngle.value) + gaitPhase,
            spacing: options.limbDecorationSpacing.value,
            width: options.limbDecorationSize.value + 4,
            height: options.limbDecorationSize.value + 4,
            zIndex: 8,
            opacity: 0.92,
            fontSize: options.limbDecorationSize.value,
            color: '#8f3b20'
          }),
          ...createDecorationTextChain({
            idPrefix: `limb-right-${limbGroupIndex}`,
            kind: 'limb',
            side: 'right',
            text: options.limbDecorationText.value,
            anchor: rightLimb,
            openAngle: degreesToRadians(options.limbOpenAngle.value) + gaitPhase,
            spacing: options.limbDecorationSpacing.value,
            width: options.limbDecorationSize.value + 4,
            height: options.limbDecorationSize.value + 4,
            zIndex: 8,
            opacity: 0.92,
            fontSize: options.limbDecorationSize.value,
            color: '#8f3b20'
          })
        );
      });
    }

    return decorations;
  });
