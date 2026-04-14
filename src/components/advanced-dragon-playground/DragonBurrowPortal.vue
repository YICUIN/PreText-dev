<template>
  <div
    class="dragon-burrow-portal"
    :class="{
      'dragon-burrow-portal--active': isActive,
      'dragon-burrow-portal--fading': hasFullyEmerged,
    }"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
    }">
    <div class="dragon-burrow-portal__aura"></div>
    <div class="dragon-burrow-portal__rim"></div>
    <div class="dragon-burrow-portal__core"></div>
    <div class="dragon-burrow-portal__debris dragon-burrow-portal__debris--1"></div>
    <div class="dragon-burrow-portal__debris dragon-burrow-portal__debris--2"></div>
    <div class="dragon-burrow-portal__debris dragon-burrow-portal__debris--3"></div>
    <div class="dragon-burrow-portal__ember dragon-burrow-portal__ember--1"></div>
    <div class="dragon-burrow-portal__ember dragon-burrow-portal__ember--2"></div>
    <div class="dragon-burrow-portal__ember dragon-burrow-portal__ember--3"></div>
    <div class="dragon-burrow-portal__spark dragon-burrow-portal__spark--left"></div>
    <div class="dragon-burrow-portal__spark dragon-burrow-portal__spark--right"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  x: number;
  y: number;
  isActive: boolean;
  hasFullyEmerged: boolean;
}>();
</script>

<style scoped>
.dragon-burrow-portal {
  position: absolute;
  width: 88px;
  height: 88px;
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0;
  pointer-events: none;
  z-index: 18;
  transition:
    opacity 0.45s ease,
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    filter 2.8s ease;
  filter: saturate(1) blur(0);
}

.dragon-burrow-portal--active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.dragon-burrow-portal--fading {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.18);
  filter: saturate(0.75) blur(3px);
}

.dragon-burrow-portal__aura,
.dragon-burrow-portal__rim,
.dragon-burrow-portal__core,
.dragon-burrow-portal__spark {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.dragon-burrow-portal__aura {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 186, 92, 0.34) 0 18%,
    rgba(194, 73, 17, 0.28) 32%,
    rgba(83, 26, 9, 0.14) 50%,
    rgba(0, 0, 0, 0) 72%
  );
  animation: portalPulse 3.2s ease-in-out infinite;
}

.dragon-burrow-portal__rim {
  inset: 8px;
  border: 2px solid rgba(255, 196, 120, 0.78);
  box-shadow:
    0 0 0 8px rgba(93, 37, 16, 0.28) inset,
    0 0 24px rgba(255, 148, 67, 0.42),
    0 0 42px rgba(115, 39, 17, 0.38) inset;
  background: conic-gradient(
    from 90deg,
    rgba(255, 220, 154, 0.92),
    rgba(147, 63, 24, 0.84),
    rgba(255, 160, 74, 0.88),
    rgba(80, 24, 10, 0.88),
    rgba(255, 220, 154, 0.92)
  );
  animation: portalRotate 10s linear infinite;
}

.dragon-burrow-portal__core {
  inset: 19px;
  background: radial-gradient(
    circle at 50% 38%,
    rgba(58, 16, 9, 0.16) 0 10%,
    rgba(20, 7, 4, 0.94) 34%,
    rgba(8, 3, 2, 1) 62%
  );
  box-shadow:
    0 0 18px rgba(0, 0, 0, 0.72) inset,
    0 0 36px rgba(255, 150, 60, 0.12);
}

.dragon-burrow-portal::after {
  content: "";
  position: absolute;
  inset: 28px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 45%,
    rgba(12, 4, 2, 0.99) 0 50%,
    rgba(12, 4, 2, 0.96) 63%,
    rgba(12, 4, 2, 0) 74%
  );
  box-shadow:
    0 0 28px rgba(0, 0, 0, 0.74) inset,
    0 0 10px rgba(255, 128, 48, 0.14);
}

.dragon-burrow-portal__spark {
  inset: auto;
  width: 18px;
  height: 18px;
  top: 16px;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 233, 183, 0.95) 0 24%,
    rgba(255, 148, 59, 0.68) 40%,
    rgba(255, 148, 59, 0) 72%
  );
  filter: blur(1px);
}

.dragon-burrow-portal__debris,
.dragon-burrow-portal__ember {
  position: absolute;
  pointer-events: none;
  opacity: 0;
}

.dragon-burrow-portal__debris {
  bottom: 18px;
  left: 50%;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: 45% 55% 52% 48%;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(226, 178, 130, 0.95) 0 18%,
    rgba(120, 68, 34, 0.92) 48%,
    rgba(60, 30, 14, 0.96) 100%
  );
  box-shadow: 0 0 6px rgba(41, 18, 7, 0.35);
}

.dragon-burrow-portal__ember {
  bottom: 22px;
  left: 50%;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 243, 190, 1) 0 22%,
    rgba(255, 167, 72, 0.92) 46%,
    rgba(255, 95, 28, 0.14) 76%,
    rgba(255, 95, 28, 0) 100%
  );
  filter: blur(0.8px);
  box-shadow: 0 0 10px rgba(255, 132, 48, 0.55);
}

.dragon-burrow-portal__spark--left {
  left: 10px;
  animation: portalSparkLeft 2.8s ease-in-out infinite;
}

.dragon-burrow-portal__spark--right {
  right: 9px;
  animation: portalSparkRight 2.4s ease-in-out infinite;
}

.dragon-burrow-portal__debris--1 {
  animation: portalDebrisLeft 1.9s ease-out infinite;
}

.dragon-burrow-portal__debris--2 {
  animation: portalDebrisCenter 2.3s ease-out infinite 0.45s;
}

.dragon-burrow-portal__debris--3 {
  animation: portalDebrisRight 2s ease-out infinite 0.18s;
}

.dragon-burrow-portal__ember--1 {
  animation: portalEmberLeft 1.6s ease-out infinite 0.2s;
}

.dragon-burrow-portal__ember--2 {
  animation: portalEmberCenter 1.9s ease-out infinite 0.75s;
}

.dragon-burrow-portal__ember--3 {
  animation: portalEmberRight 1.5s ease-out infinite 0.4s;
}

@keyframes portalPulse {
  0%,
  100% {
    transform: scale(0.96);
    opacity: 0.84;
  }

  50% {
    transform: scale(1.06);
    opacity: 1;
  }
}

@keyframes portalRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes portalSparkLeft {
  0%,
  100% {
    transform: translate(0, 0) scale(0.9);
    opacity: 0.72;
  }

  50% {
    transform: translate(-6px, -8px) scale(1.18);
    opacity: 1;
  }
}

@keyframes portalSparkRight {
  0%,
  100% {
    transform: translate(0, 0) scale(0.82);
    opacity: 0.66;
  }

  50% {
    transform: translate(7px, -10px) scale(1.12);
    opacity: 1;
  }
}

@keyframes portalDebrisLeft {
  0% {
    transform: translate(-4px, 0) scale(0.75) rotate(0deg);
    opacity: 0;
  }

  15% {
    opacity: 0.95;
  }

  100% {
    transform: translate(-34px, 22px) scale(0.2) rotate(-120deg);
    opacity: 0;
  }
}

@keyframes portalDebrisCenter {
  0% {
    transform: translate(0, 0) scale(0.8) rotate(0deg);
    opacity: 0;
  }

  18% {
    opacity: 0.86;
  }

  100% {
    transform: translate(4px, 28px) scale(0.16) rotate(145deg);
    opacity: 0;
  }
}

@keyframes portalDebrisRight {
  0% {
    transform: translate(6px, 0) scale(0.78) rotate(0deg);
    opacity: 0;
  }

  15% {
    opacity: 0.92;
  }

  100% {
    transform: translate(38px, 18px) scale(0.18) rotate(130deg);
    opacity: 0;
  }
}

@keyframes portalEmberLeft {
  0% {
    transform: translate(-3px, 0) scale(0.6);
    opacity: 0;
  }

  22% {
    opacity: 1;
  }

  100% {
    transform: translate(-30px, -24px) scale(0.12);
    opacity: 0;
  }
}

@keyframes portalEmberCenter {
  0% {
    transform: translate(0, 0) scale(0.7);
    opacity: 0;
  }

  18% {
    opacity: 0.98;
  }

  100% {
    transform: translate(6px, -34px) scale(0.08);
    opacity: 0;
  }
}

@keyframes portalEmberRight {
  0% {
    transform: translate(4px, 0) scale(0.62);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translate(28px, -22px) scale(0.1);
    opacity: 0;
  }
}
</style>
