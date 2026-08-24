<template>
  <div class="snowfall-container">
    <div
      v-for="i in 60"
      :key="i"
      class="snowflake"
      :style="{
        left: `${Math.random() * 100}%`,
        animationDuration: `${6 + Math.random() * 12}s`,
        animationDelay: `${Math.random() * 8}s`,
        fontSize: `${10 + Math.random() * 20}px`,
        opacity: 0.3 + Math.random() * 0.5,
        transform: `rotate(${Math.random() * 360}deg)`,
      }"
    >
      ❄
    </div>
  </div>
</template>

<style scoped>
.snowfall-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -30px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  animation: fall linear infinite;
  user-select: none;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg) translateX(0);
    opacity: 0.8;
  }
  25% {
    transform: translateY(25vh) rotate(90deg) translateX(15px);
  }
  50% {
    transform: translateY(50vh) rotate(180deg) translateX(-15px);
    opacity: 0.6;
  }
  75% {
    transform: translateY(75vh) rotate(270deg) translateX(10px);
  }
  100% {
    transform: translateY(110vh) rotate(360deg) translateX(-10px);
    opacity: 0.2;
  }
}
</style>