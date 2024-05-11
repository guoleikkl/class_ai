<template>
  <div>
    <!-- <el-segmented v-model="options[currentStep]" :options="options" block @change="updatePage" /> -->
    <el-segmented v-model="step" :options="options" @change="updatePage" />
  </div>
  <div>
    <el-button type="primary" @click="nextStep">下一步</el-button>
  </div>
</template>


<script lang="ts" setup>
import { useFormLabelWidth } from 'element-plus/es/components/form/src/utils.mjs';
import { watch } from 'fs';
import { ref, withDefaults, defineProps, defineEmits, watchEffect } from 'vue'


const props = defineProps({
  currentStep: {
    type: Number,
    default: 0
  },

})



const emit = defineEmits(['changeStep'])




const options = [
  {
    label: '描述需求',
    value: '描述需求',
    disabled: false
  },
  {
    label: '课程介绍',
    value: '课程介绍',
    disabled: true
  },
  {
    label: '目录大纲',
    value: '目录大纲',
    disabled: true
  },
  {
    label: '教案',
    value: '教案',
    disabled: true
  },
  {
    label: '讲义',
    value: '讲义',
    disabled: true
  },
  {
    label: 'PPT',
    value: 'PPT',
    disabled: true
  }
]


const step = ref(options[props.currentStep].value)

// 手动选择之前的步骤
const updatePage = (newval: any) => {
  emit('changeStep', options.findIndex((item) => item.value === newval))
}

// 点击下一步
const nextStep = () => {
  if (props.currentStep < options.length - 1) {

    options[props.currentStep + 1].disabled = false
    step.value = options[props.currentStep + 1].value;
    emit('changeStep', props.currentStep + 1)
  }
}

watchEffect(() => {
  if (props.currentStep < options.length) {
    

    options[props.currentStep].disabled = false
    step.value = options[props.currentStep].value;
    // emit('changeStep', props.currentStep + 1)
  }
})


</script>