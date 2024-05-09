<script lang="ts" setup>
//引入VueOfficeDocx组件
import VueOfficeDocx from '@vue-office/docx'
//引入相关样式
import '@vue-office/docx/lib/index.css'
import { ref, withDefaults, defineProps, defineEmits, inject, watch, watchEffect } from 'vue'

const srcList = inject('fileList1')

// console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', srcList)



const version = ref(0)
// console.log('version', version.value)
const maxVersion = ref(srcList.length - 1)
// console.log('maxVersion', maxVersion.value)
const docx = ref(srcList[version.value])

// console.log('bbbbbbbb', docx.value)


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
        version.value--
        changeDocx()
    }
    // this.version--
}

// 更换文档
function changeDocx() {
    // 后面可根据后端传回的数据进行更换
    docx.value = srcList[version.value]
    // this.$refs.vueOfficeDocx.reload()
}


function renderedHandler() {
    console.log("渲染完成")
}
function errorHandler() {
    console.log("渲染失败")
}

watch(srcList, async (newQuestion, oldQuestion) => {
    // console.log("dddddddddfdfffffffffffffffffffffffffff", srcList)
    maxVersion.value = srcList.length - 1
    // console.log("maxVersion", maxVersion.value)
    version.value = maxVersion.value
    // console.log("version", version.value)
    docx.value = srcList[version.value]
    // console.log("docx", docx.value)

})


</script>

<template>
    <el-button-group>
        <el-button type="primary" @click="downVersion">上个版本</el-button>
        <el-button type="primary">版本：{{ version + 1 }}/{{ maxVersion + 1 }}</el-button>
        <el-button type="primary" @click="upVersion">下个版本</el-button>
    </el-button-group>
    <vue-office-docx :src="docx" style="height: 100vh;" @rendered="renderedHandler" @error="errorHandler" />

</template>