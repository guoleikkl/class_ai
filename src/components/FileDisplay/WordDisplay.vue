<script>
//引入VueOfficeDocx组件
import VueOfficeDocx from '@vue-office/docx'
//引入相关样式
import '@vue-office/docx/lib/index.css'

export default {
    components: {
        VueOfficeDocx
    },
    data() {
        return {
            version: 2,
            maxVersion: 6,
            docx: 'http://static.shanhuxueyuan.com/test2.docx', //设置文档网络地址，可以是相对地址
        }
    },

    methods: {
        // 版本切换
        upVersion() {
            if (this.version < this.maxVersion) {
                this.version++
                this.changeDocx()
            }
            // this.version++
        },
        downVersion() {
            if (this.version > 1) {
                this.version--
                this.changeDocx()
            }
            // this.version--
        },

        // 更换文档
        changeDocx() {
            // 后面可根据后端传回的数据进行更换
            this.docx = 'http://static.shanhuxueyuan.com/test' + this.version + '.docx'
            // this.$refs.vueOfficeDocx.reload()
        },


        renderedHandler() {
            console.log("渲染完成")
        },
        errorHandler() {
            console.log("渲染失败")
        }
    }
}



</script>

<template>
  <el-button-group>
        <el-button type="primary" @click="downVersion">上个版本</el-button>
        <el-button type="primary">版本：{{ version }}/{{ maxVersion }}</el-button>
        <el-button type="primary" @click="upVersion">下个版本</el-button>
    </el-button-group>
    <vue-office-docx :src="docx" style="height: 100vh;" @rendered="renderedHandler" @error="errorHandler" />

</template>