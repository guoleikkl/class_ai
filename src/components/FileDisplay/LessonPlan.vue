<template>

  <WordDisplay :srcList="fileList3"/>
  <!-- <WordDisplay :urlList="props.fileList/> -->
</template>


<script lang="ts" setup>
import { defineProps } from 'vue'
import { watch } from 'vue'
// import { type PropType } from 'vue';

const props = defineProps<{
fileList3: string[]
}>()





</script>
