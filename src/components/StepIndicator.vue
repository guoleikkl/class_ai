<template>
  <div>
    <el-segmented v-model="value" :options="options" block @change="updatePage"/>
  </div>
</template>


<script lang="ts" setup>
import { ref, withDefaults, defineProps, defineEmits  } from 'vue'
const props = withDefaults(defineProps(), {})

const emit = defineEmits(['update:page'])
const value = ref('课程介绍')

const options = [
  '课程介绍',
  '目录大纲',
  '教案',
  '讲义',
  'PPT',
]
const updatePage=(newval:string)=>{
  emit('update:page',newval)
}
</script>