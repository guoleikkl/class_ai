<template>
    <div class="text-display">
      <p>{{ text }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from 'vue'
  
  const props = defineProps({
    text: String
  });
  </script>
  
  <style scoped>
  .text-display {
    padding: 20px;
    border: 1px solid #ccc;
    margin: 10px;
    overflow-y: auto;  /* 如果文本很多，需要滚动 */
  }
  </style>
  