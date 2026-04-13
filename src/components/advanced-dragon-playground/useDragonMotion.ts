import { reactive, ref, type Ref } from "vue";

import type { DragonSegment, Point } from "./types";

// useDragonMotion 的输入全部来自父组件的响应式配置。
// 这里不持有 UI，只负责把“配置 -> 运动结果”转换成龙的头部位置、轨迹和各段姿态。
type DragonMotionOptions = {
  // 动画舞台容器。用于把鼠标坐标换算到局部坐标系，并读取边界尺寸做自动巡航反弹。
  container: Ref<HTMLElement | null>;
  // 龙身文本内容。每个字符对应一节龙身段。
  dragonTextContent: Ref<string>;
  // 手动模式下的跟随速度。数值越小越灵敏，因为当前位置每帧按 dx / dragonSpeed 逼近目标点。
  dragonSpeed: Ref<number>;
  // 龙身摆动基础幅度。鼠标移动和反弹都会围绕这个值叠加动态摆动。
  baseSwingAmplitude: Ref<number>;
  // 是否允许自动巡航。
  autoMoveEnabled: Ref<boolean>;
  // 自动巡航目标速度。不是直接写位置，而是转成速度目标再渐近逼近。
  autoMoveSpeed: Ref<number>;
};

// 这个 composable 的职责边界：
// 1. 维护“龙头位置 -> 轨迹 -> 全身段位”的链路
// 2. 处理鼠标输入和自动巡航
// 3. 输出给渲染层使用的 dragonSegments 和 velocity
export const useDragonMotion = ({
  container,
  dragonTextContent,
  dragonSpeed,
  baseSwingAmplitude,
  autoMoveEnabled,
  autoMoveSpeed,
}: DragonMotionOptions) => {
  // dragonSegments 是最终渲染层真正使用的数据。
  // headTrail 是头部历史路径，龙身通过对这条路径做弧长采样实现“蛇形延迟跟随”。
  const dragonSegments = ref<DragonSegment[]>([]);
  const headTrail = ref<Point[]>([]);

  // mousePosition 是龙头当前真实位置，targetPosition 是手动模式下鼠标目标点。
  const mousePosition = reactive({ x: 100, y: 100 });
  const targetPosition = reactive({ x: 100, y: 100 });
  const mouseMoving = ref(false);
  const mouseStopTime = ref(0);
  // dragonDirection 始终表示当前运动方向，用于头部朝向和自动巡航。
  const dragonDirection = reactive({ x: 1, y: 0 });

  // autoMoveActive 表示“自动巡航当前是否正在生效”。
  // 鼠标进入容器时不会关闭总开关，只会暂停当前自动巡航。
  const autoMoveActive = ref(false);
  const lastMousePosition = reactive({ x: 100, y: 100 });
  const lastMouseDirection = reactive({ x: 1, y: 0 });

  // velocity 是统一的运动速度向量：
  // - 自动模式下直接决定头部推进速度
  // - 手动模式下既用于移动，也作为碰撞强度输入给文本物理层
  const velocity = reactive({ x: 0, y: 0 });
  const isBouncing = ref(false);
  const currentSwingAmplitude = ref(5);

  const bounceDamping = 0.85;
  const trailPointSpacing = 4;
  const segmentDistance = 20;
  const mouseStopThreshold = 500;

  // 小工具：统一用欧氏距离，避免多处重复写 hypot。
  const getPointDistance = (from: Point, to: Point) => Math.hypot(to.x - from.x, to.y - from.y);

  // 轨迹缓存的最大点数按龙身长度推导，避免文本变长后轨迹不够，也避免无上限增长。
  const getMaxTrailPoints = (segmentCount: number) => {
    const totalLength = Math.max(1, segmentCount) * segmentDistance;
    return Math.ceil(totalLength / trailPointSpacing) + 24;
  };

  // 轨迹实际保留的最大弧长略大于整条龙身长度，给尾部和摆动留出余量。
  const getMaxTrailLength = (segmentCount: number) => {
    return Math.max(1, segmentCount - 1) * segmentDistance + trailPointSpacing * 6;
  };

  // 裁剪头部历史轨迹。
  // 思路是沿轨迹累计弧长，只保留足够覆盖整条龙身的那一段。
  const trimHeadTrail = () => {
    if (headTrail.value.length <= 1) {
      return;
    }

    const maxTrailLength = getMaxTrailLength(dragonSegments.value.length);
    const trimmedTrail: Point[] = [headTrail.value[0]];
    let traveled = 0;

    for (let index = 1; index < headTrail.value.length; index += 1) {
      const previousPoint = trimmedTrail[trimmedTrail.length - 1];
      const currentPoint = headTrail.value[index];
      const segmentLength = getPointDistance(previousPoint, currentPoint);

      if (segmentLength < 0.001) {
        continue;
      }

      if (traveled + segmentLength >= maxTrailLength) {
        const ratio = (maxTrailLength - traveled) / segmentLength;
        trimmedTrail.push({
          x: previousPoint.x + (currentPoint.x - previousPoint.x) * ratio,
          y: previousPoint.y + (currentPoint.y - previousPoint.y) * ratio,
        });
        headTrail.value = trimmedTrail;
        return;
      }

      trimmedTrail.push(currentPoint);
      traveled += segmentLength;
    }

    headTrail.value = trimmedTrail;
  };

  // 把头部当前位置写入轨迹。
  // 如果两帧间距离较大，会补插值点，避免身体沿轨迹采样时出现“断档”。
  const pushHeadTrailPoint = (point: Point) => {
    if (headTrail.value.length === 0) {
      headTrail.value = [{ ...point }];
      return;
    }

    const latestPoint = headTrail.value[0];
    const distance = getPointDistance(point, latestPoint);

    if (distance < 0.001) {
      headTrail.value[0] = { ...point };
      return;
    }

    const interpolatedPoints: Point[] = [{ ...point }];
    const steps = Math.floor(distance / trailPointSpacing);

    for (let step = 1; step <= steps; step += 1) {
      const ratio = (step * trailPointSpacing) / distance;
      if (ratio >= 1) {
        break;
      }

      interpolatedPoints.push({
        x: point.x + (latestPoint.x - point.x) * ratio,
        y: point.y + (latestPoint.y - point.y) * ratio,
      });
    }

    headTrail.value = [...interpolatedPoints, ...headTrail.value];
    trimHeadTrail();
  };

  // 在头部轨迹上按“距离头部的弧长”采样位置。
  // 这是龙身跟随效果的核心：第 i 段永远位于 i * segmentDistance 的轨迹位置。
  const getTrailPointAtDistance = (distanceFromHead: number): Point => {
    if (headTrail.value.length === 0) {
      return { x: mousePosition.x, y: mousePosition.y };
    }

    if (distanceFromHead <= 0) {
      return headTrail.value[0];
    }

    let traveled = 0;

    for (let index = 1; index < headTrail.value.length; index += 1) {
      const newerPoint = headTrail.value[index - 1];
      const olderPoint = headTrail.value[index];
      const segmentLength = getPointDistance(newerPoint, olderPoint);

      if (segmentLength < 0.001) {
        continue;
      }

      if (traveled + segmentLength >= distanceFromHead) {
        const ratio = (distanceFromHead - traveled) / segmentLength;
        return {
          x: newerPoint.x + (olderPoint.x - newerPoint.x) * ratio,
          y: newerPoint.y + (olderPoint.y - newerPoint.y) * ratio,
        };
      }

      traveled += segmentLength;
    }

    return headTrail.value[headTrail.value.length - 1];
  };

  // 把当前轨迹同步成每一段龙身的渲染姿态。
  // 顺序是：
  // 1. 头部使用当前位置和方向
  // 2. 身体沿轨迹按固定弧长采样
  // 3. 每段朝向由前一段与当前段之间的向量决定
  // 4. 再叠加一个轻微摆动，让跟随不那么“机械”
  const syncDragonSegmentsWithTrail = () => {
    if (dragonSegments.value.length === 0) {
      return;
    }

    const now = Date.now();
    const headPoint = getTrailPointAtDistance(0);

    dragonSegments.value[0].x = headPoint.x;
    dragonSegments.value[0].y = headPoint.y;
    dragonSegments.value[0].angle = Math.atan2(dragonDirection.y, dragonDirection.x);

    for (let index = 1; index < dragonSegments.value.length; index += 1) {
      const currentSegment = dragonSegments.value[index];
      const previousSegment = dragonSegments.value[index - 1];
      const trailPoint = getTrailPointAtDistance(index * segmentDistance);
      currentSegment.x = trailPoint.x;
      currentSegment.y = trailPoint.y;

      const dx = previousSegment.x - currentSegment.x;
      const dy = previousSegment.y - currentSegment.y;
      const distance = Math.hypot(dx, dy);
      currentSegment.angle = distance > 0.001 ? Math.atan2(dy, dx) : previousSegment.angle;
    }

    dragonSegments.value.forEach((segment, index) => {
      if (index === 0) {
        return;
      }

      const swingStrength = Math.sin(now * 0.005 - index * 0.65) * currentSwingAmplitude.value;
      segment.x += Math.sin(segment.angle) * swingStrength;
      segment.y -= Math.cos(segment.angle) * swingStrength;
    });
  };

  // 重新初始化整条龙。
  // 这个方法在首次挂载和龙身文本内容变化时调用，确保轨迹、位置和方向全部回到一致状态。
  const initializeDragon = () => {
    const chars = Array.from(dragonTextContent.value);
    const startPoint = { x: 100, y: 100 };

    dragonSegments.value = chars.map((char, index) => ({
      x: startPoint.x - index * segmentDistance,
      y: startPoint.y,
      char,
      angle: 0,
    }));

    headTrail.value = Array.from({ length: getMaxTrailPoints(chars.length) }, () => ({ ...startPoint }));

    mousePosition.x = startPoint.x;
    mousePosition.y = startPoint.y;
    targetPosition.x = startPoint.x;
    targetPosition.y = startPoint.y;
    mouseMoving.value = false;
    mouseStopTime.value = 0;
    dragonDirection.x = 1;
    dragonDirection.y = 0;
    currentSwingAmplitude.value = baseSwingAmplitude.value;
    velocity.x = 0;
    velocity.y = 0;
    autoMoveActive.value = false;
    isBouncing.value = false;

    syncDragonSegmentsWithTrail();
  };

  // 用来判断“鼠标是否已经停止驱动”。
  // 停止后会逐步减小当前摆动幅度，让龙从动态状态平滑回稳。
  const checkMouseStop = () => {
    const now = Date.now();
    if (mouseMoving.value && now - mouseStopTime.value > mouseStopThreshold) {
      mouseMoving.value = false;
    }

    if (mouseMoving.value) {
      currentSwingAmplitude.value += (baseSwingAmplitude.value - currentSwingAmplitude.value) * 0.1;
      return;
    }

    currentSwingAmplitude.value *= 0.9;
    if (currentSwingAmplitude.value < 0.01) {
      currentSwingAmplitude.value = 0;
    }
  };

  // 单帧更新龙运动。
  // 这是 composable 的主循环入口：
  // - 先更新输入状态（鼠标停顿 / 自动巡航）
  // - 再得到头部新位置
  // - 最后把头部位置写入轨迹，并同步全身段位
  const updateDragon = () => {
    checkMouseStop();

    if (autoMoveEnabled.value && autoMoveActive.value) {
      // 自动模式使用“目标速度渐近”而不是“固定加速度 + 阻尼衰减”。
      // 这样 autoMoveSpeed 能更直接决定巡航速度，不会过早收敛到固定上限。
      const cruiseSpeed = autoMoveSpeed.value * 0.22;
      const steeringStrength = 0.22;
      const desiredVelocityX = dragonDirection.x * cruiseSpeed;
      const desiredVelocityY = dragonDirection.y * cruiseSpeed;

      velocity.x += (desiredVelocityX - velocity.x) * steeringStrength;
      velocity.y += (desiredVelocityY - velocity.y) * steeringStrength;

      if (!container.value) {
        return;
      }

      const containerRect = container.value.getBoundingClientRect();
      const bounceMargin = 30;

      let hitLeft = false;
      let hitRight = false;
      let hitTop = false;
      let hitBottom = false;

      const nextX = mousePosition.x + velocity.x;
      const nextY = mousePosition.y + velocity.y;

      if (nextX < bounceMargin) {
        hitLeft = true;
      } else if (nextX > containerRect.width - bounceMargin) {
        hitRight = true;
      }

      if (nextY < bounceMargin) {
        hitTop = true;
      } else if (nextY > containerRect.height - bounceMargin) {
        hitBottom = true;
      }

      if (hitLeft || hitRight || hitTop || hitBottom) {
        isBouncing.value = true;

        // 根据碰撞边构造法线，用于速度反射。
        let normalX = 0;
        let normalY = 0;

        if (hitLeft) normalX = 1;
        else if (hitRight) normalX = -1;

        if (hitTop) normalY = 1;
        else if (hitBottom) normalY = -1;

        if ((hitLeft || hitRight) && (hitTop || hitBottom)) {
          normalX = hitLeft ? 1 : -1;
          normalY = hitTop ? 1 : -1;
        }

        const normalLength = Math.hypot(normalX, normalY);
        if (normalLength > 0) {
          const nX = normalX / normalLength;
          const nY = normalY / normalLength;
          const velocityAlongNormal = velocity.x * nX + velocity.y * nY;

          // 只有速度确实朝边界压过去时才反射，避免贴边抖动。
          if (velocityAlongNormal < 0) {
            velocity.x -= 2 * velocityAlongNormal * nX;
            velocity.y -= 2 * velocityAlongNormal * nY;
            velocity.x *= bounceDamping;
            velocity.y *= bounceDamping;

            const reflectedSpeed = Math.hypot(velocity.x, velocity.y);
            if (reflectedSpeed > 0.1) {
              dragonDirection.x = velocity.x / reflectedSpeed;
              dragonDirection.y = velocity.y / reflectedSpeed;
            }

            currentSwingAmplitude.value = Math.min(30, currentSwingAmplitude.value + 15);

            if (hitLeft) mousePosition.x = bounceMargin + 5;
            else if (hitRight) mousePosition.x = containerRect.width - bounceMargin - 5;
            if (hitTop) mousePosition.y = bounceMargin + 5;
            else if (hitBottom) mousePosition.y = containerRect.height - bounceMargin - 5;
          }
        }
      } else {
        isBouncing.value = false;
      }

      mousePosition.x += velocity.x;
      mousePosition.y += velocity.y;
    } else {
      const dx = targetPosition.x - mousePosition.x;
      const dy = targetPosition.y - mousePosition.y;
      const distance = Math.hypot(dx, dy);

      if (distance > 1) {
        mousePosition.x += dx / dragonSpeed.value;
        mousePosition.y += dy / dragonSpeed.value;
        velocity.x = dx / dragonSpeed.value;
        velocity.y = dy / dragonSpeed.value;
      } else {
        velocity.x *= 0.9;
        velocity.y *= 0.9;
        if (Math.hypot(velocity.x, velocity.y) < 0.01) {
          velocity.x = 0;
          velocity.y = 0;
        }
      }
    }

    // 统一用当前速度刷新运动方向，保证头部和碰撞层都使用同一份方向语义。
    const movedDistance = Math.hypot(velocity.x, velocity.y);
    if (movedDistance > 0.001) {
      dragonDirection.x = velocity.x / movedDistance;
      dragonDirection.y = velocity.y / movedDistance;
    }

    if (isBouncing.value && currentSwingAmplitude.value > 20) {
      const now = Date.now();
      dragonSegments.value.forEach((segment, index) => {
        if (index > 0) {
          const bounceWobble = Math.sin(now * 0.01 + index * 0.5) * currentSwingAmplitude.value * 0.3;
          segment.x += Math.sin(segment.angle) * bounceWobble * 0.1;
          segment.y -= Math.cos(segment.angle) * bounceWobble * 0.1;
        }
      });
    }

    pushHeadTrailPoint({ x: mousePosition.x, y: mousePosition.y });
    syncDragonSegmentsWithTrail();
  };

  // 手动模式输入：把鼠标位置映射到容器局部坐标，并记住最后一段有效方向。
  // 最后方向会在自动巡航启动时作为初始方向。
  const handleMouseMove = (event: MouseEvent) => {
    if (!container.value) {
      return;
    }

    const rect = container.value.getBoundingClientRect();
    const newX = event.clientX - rect.left;
    const newY = event.clientY - rect.top;
    const dx = newX - lastMousePosition.x;
    const dy = newY - lastMousePosition.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0.5) {
      lastMouseDirection.x = dx / distance;
      lastMouseDirection.y = dy / distance;
    }

    targetPosition.x = newX;
    targetPosition.y = newY;
    lastMousePosition.x = newX;
    lastMousePosition.y = newY;
    mouseMoving.value = true;
    mouseStopTime.value = Date.now();

    if (autoMoveEnabled.value) {
      autoMoveActive.value = false;
    }
  };

  // 鼠标离开容器时，如果自动模式开启，就切换成自动巡航。
  const handleMouseLeave = (event: MouseEvent) => {
    if (!container.value || !autoMoveEnabled.value) {
      return;
    }

    const rect = container.value.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
      lastMousePosition.x = mouseX;
      lastMousePosition.y = mouseY;
      dragonDirection.x = lastMouseDirection.x;
      dragonDirection.y = lastMouseDirection.y;
      autoMoveActive.value = true;
    }
  };

  // 鼠标重新进入容器时暂停自动巡航，交还给手动模式。
  const handleMouseEnter = () => {
    if (autoMoveEnabled.value) {
      autoMoveActive.value = false;
    }
  };

  return {
    dragonSegments,
    velocity,
    initializeDragon,
    updateDragon,
    handleMouseMove,
    handleMouseLeave,
    handleMouseEnter,
  };
};
