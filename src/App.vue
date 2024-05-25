<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style lang="scss">

@import './assets/styles/global.scss';
#app {
  height: 100%;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>