<script lang="ts" setup>
//引入VueOfficeDocx组件
import VueOfficeDocx from '@vue-office/docx'
//引入相关样式
import '@vue-office/docx/lib/index.css'
import { sr } from 'element-plus/es/locale/index.mjs';
import { ref, withDefaults, defineProps, defineEmits, inject, watch, watchEffect } from 'vue'


const props = defineProps<{
    srcList: string[]
}>()


const version = ref(0)

const maxVersion = ref(props.srcList.length - 1)
let docx = ref(props.srcList[version.value])



// // 版本切换
function upVersion() {
    if (version.value < maxVersion.value) {

        version.value++
        changeDocx()
    }
    // this.version++
}

function downVersion() {

    if (version.value > 0) {
        
        version.value = version.value - 1

        changeDocx()
    }
    // this.version--
}

// 更换文档
function changeDocx() {
    docx.value = props.srcList[version.value]
}


function renderedHandler() {

    console.log("渲染完成", props.srcList)
}
function errorHandler() {
    console.log("渲染失败", props.srcList)
}


// watchEffect 用于在初始化或其他依赖改变时同步数据
// watchEffect(() => {
//     if(props.srcList === undefined) {
//         return
//     }
//     maxVersion.value = props.srcList.length - 1
//     version.value = maxVersion.value
//     docx.value = props.srcList[version.value]

    
// })

watch(() => props.srcList, (newSrcList, oldSrcList) => {
    maxVersion.value = newSrcList.length - 1;  // 更新最大版本号
    version.value = maxVersion.value;          // 重置到最新版本
    docx.value = newSrcList[version.value];    // 更新文档来源
}, {
    deep: true  // 如果srcList是一个复杂对象或数组，你可能需要deep watch
});


</script>


<template>
    <el-button-group>
        <el-button type="primary" @click="downVersion">上个版本</el-button>
        <el-button type="primary">版本：{{ version + 1 }}/{{ maxVersion + 1 }}</el-button>
        <el-button type="primary" @click="upVersion">下个版本</el-button>
    </el-button-group>
    <vue-office-docx :src="docx" style="height: 100vh;" @rendered="renderedHandler" @error="errorHandler" />
</template>