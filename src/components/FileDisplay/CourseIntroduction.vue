<template>
    <WordDisplay :srcList="fileList1"/>
    <!-- <WordDisplay :urlList="props.fileList/> -->
</template>


<script lang="ts" setup>
import { defineProps } from 'vue'
import { watch } from 'vue'
// import { type PropType } from 'vue';

const props = defineProps<{
  fileList1: string[]
}>()





</script>
