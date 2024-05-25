<template>
    <WordDisplay :srcList="fileList1" />
</template>


<script lang="ts" setup>
import { defineProps } from 'vue'
import { watch } from 'vue'

const props = defineProps<{
  fileList1: string[]
}>()





</script>
