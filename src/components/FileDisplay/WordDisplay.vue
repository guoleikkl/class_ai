<script lang="ts" setup>
//引入VueOfficeDocx组件
import VueOfficeDocx from '@vue-office/docx'
import VueOfficePdf from '@vue-office/pdf'
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/docx/lib/index.css'
import '@vue-office/excel/lib/index.css'

import { ref, withDefaults, defineProps, defineEmits, inject, watch, watchEffect } from 'vue'
import { getExtend, readBuffer, render,getFileName } from "@/components/FileDisplay/util";

import { Delete, Edit, Search, Share, Upload, Download } from '@element-plus/icons-vue'

const props = defineProps<{
    srcList: string[]
}>()


const version = ref(0)

const maxVersion = ref(props.srcList.length - 1)
let url = ref(props.srcList[version.value])

let extend = ref(getExtend(props.srcList[version.value]));


const settings = ref({
  readOnly: true, // 设置为只读模式
  view: {
    height: () => document.documentElement.clientHeight,
    width: () => document.documentElement.clientWidth
  }
});


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
    extend.value = getExtend(props.srcList[version.value])
    url.value = props.srcList[version.value]
}


function renderedHandler() {

    console.log("渲染完成")
}
function errorHandler() {
    console.log("渲染失败")
}


function download() {
    console.log("下载", props.srcList)
    const link = document.createElement('a');
    if (extend.value === 'pdf') {
        link.href = getFileName(url.value) + '.pptx';
        link.download = 'file'+version.value+extend.value;
        link.click();
        return;
    }
    link.href = url.value;
    link.download = 'file'+version.value+extend.value;
    link.click();
}




watch(() => props.srcList, (newSrcList, oldSrcList) => {
    maxVersion.value = newSrcList.length - 1;  // 更新最大版本号
    version.value = maxVersion.value;          // 重置到最新版本
    // changeDocx();                             // 更新文档
    extend.value = getExtend(props.srcList[version.value])
    url.value = props.srcList[version.value]
    // docx.value = newSrcList[version.value];    // 更新文档来源
}, {
    deep: true  // 如果srcList是一个复杂对象或数组，你可能需要deep watch
});


</script>


<template>
    <div style="display: flex; justify-content: space-between;">
        <el-button-group>
            <el-button type="primary" @click="downVersion">上个版本</el-button>
            <el-button type="primary">版本：{{ version + 1 }}/{{ maxVersion + 1 }}</el-button>
            <el-button type="primary" @click="upVersion">下个版本</el-button>
        </el-button-group>
        <el-button type="primary" :icon="Download" @click="download">下载</el-button>
    </div>

    <vue-office-docx v-if="extend === 'docx'" :src="url" style="height: 100vh;" @rendered="renderedHandler"
        @error="errorHandler" />
    <vue-office-excel v-else-if="extend === 'xlsx'" :src="url" style="height: 92%;" @rendered="renderedHandler"
        @error="errorHandler" settings="settings"/>
    <vue-office-pdf v-else-if="extend === 'pdf'" :src="url" style="height: 100vh;" @rendered="renderedHandler"
        @error="errorHandler" />

</template>