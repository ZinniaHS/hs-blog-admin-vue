<template>
  <RouterView />
</template>

<style>
/* 全局过渡基础样式 */
.router-view {
  display: block;
  position: relative;
  will-change: transform;
}

html {
  perspective: 1000px;
}
</style>