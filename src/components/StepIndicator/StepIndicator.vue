<template>
  <div class="segment-style" style="width: 100%; display: flex; justify-content: space-between;">

    <el-segmented v-model="step" :options="options" @change="updatePage" />
    <el-button @click="nextStep" type="success" round
      style="background-color: #409EFF; height:  32px; width: 10%;">下一步</el-button>


  </div>
</template>


<script lang="ts" setup>
import { useFormLabelWidth } from 'element-plus/es/components/form/src/utils.mjs';
import { ref, withDefaults, defineProps, defineEmits, watchEffect, type Prop, type PropType } from 'vue'
import { Right, Download } from '@element-plus/icons-vue'

const props = defineProps({
  currentStep: {
    type: Number,
    default: 0
  },
  currentMaxStep: {
    type: Number,
    default: 0
  }

})



const emit = defineEmits(['changeStep'])



const value_2 = ref('')

const options_2 = [
  {
    label: '下一步',
    value: '下一步',
    disabled: false
  }
]


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
  },
  {
    label: '数字人',
    value: '数字人',
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
  console.log('121212')

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

  for (let i = 0; i <= props.currentMaxStep; i++) {
    options[i].disabled = false
  }
  for (let i = props.currentMaxStep + 1; i < options.length; i++) {
    options[i].disabled = true
  }

})


</script>

<style scoped>
.segment-style .el-segmented {
  width: 80%;
  height: 36px;


  --el-segmented-item-selected-bg-color: #409EFF;
  --el-border-radius-base: 16px;
}
</style>