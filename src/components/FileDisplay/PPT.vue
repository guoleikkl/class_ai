<template>
  <el-button-group>
    <el-button type="primary" @click="downVersion">上个版本</el-button>
    <el-button type="primary">版本：{{ version }}/{{ fileList5.length }}</el-button>
    <el-button type="primary" @click="upVersion">下个版本</el-button>
  </el-button-group>
  <div class="container">
    <div v-show="loading" class="well loading">正在加载中，请等待...</div>
    <div v-show="!loading" class="well" ref="output"></div>
  </div>
</template>
<script>

import { getExtend, readBuffer, render } from "@/components/FileDisplay/util";
import { parse } from "qs";
import axios from "axios";
import { watchEffect } from "vue";

export default {
  name: "PPT",
  data() {
    return {
      // 加载状态跟踪
      loading: false,
      // 上个渲染实例
      last: null,
      // 隐藏头部，当基于消息机制渲染，将隐藏
      hidden: false,
      // 当前版本
      version: 1,
      // 按钮状态
      disabled: false,
    };
  },

  // 使用 props 接收从父组件传递的字符串数组
  props: {
    fileList5: {
      type: Array,
      required: true,
    },
  },

  created() {
    // 允许使用预留的消息机制发送二进制数据，必须在url后添加?name=xxx.xxx&from=xxx
    const { from, name } = parse(location.search.substr(1));
    if (from) {
      this.handleChange({ target: { files: [new File([], name)] } });
      window.addEventListener("message", (event) => {
        const { origin, data: blob } = event;
        if (origin === from && blob instanceof Blob) {
          // 构造响应，自动渲染
          const file = new File([blob], name, {});
          this.hidden = true;
        }
      });
    }
  },

  mounted() {
    // 页面加载后执行的代码
    if (this.fileList5.length === 0) {
      this.loading = false;
      return;
    }
    this.handleChange();
  },

  // 添加监听器
  watch: {
    fileList5: {
      handler: function (val, oldVal) {
        this.handleChange();
      },
      deep: true,
    },
  },


methods: {
    async handleChange(e) {
    this.loading = true;
    try {
      const response = await axios({
        url: this.fileList5[this.version - 1],
        method: 'GET',
        responseType: 'arraybuffer', // 重要：设置响应类型为arraybuffer
      });
      const arrayBuffer = response.data;
      this.loading = false;
      this.last = await this.displayResult(arrayBuffer);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  },

  displayResult(buffer) {
    // 取得文件名
    // 暂时固定为test.pptx，之后可以通过参数传递
    const name = 'test.pptx';
    // 取得扩展名
    const extend = getExtend(name);
    // 输出目的地
    const { output } = this.$refs;
    // 生成新的dom
    const node = document.createElement("div");
    // 添加孩子，防止vue实例替换dom元素
    if (this.last) {
      output.removeChild(this.last.$el);
      this.last.$destroy();
    }
    const child = output.appendChild(node);
    // 调用渲染方法进行渲染
    return new Promise((resolve, reject) =>
      render(buffer, extend, child).then(resolve).catch(reject)
    );
  },

  // 版本切换
  upVersion() {
    if (this.version < this.fileList5.length) {
      this.version++
      this.handleChange()
    }
    // this.version++
  },

  downVersion() {
    if (this.version > 1) {
      this.version--
      this.handleChange()
    }
    // this.version--
  },




},
};

</script>



<style scoped>
.banner {
  overflow: auto;
  text-align: center;
  /* background-color: #12b6ff; */
  color: #000;
}

.hidden .banner {
  display: none;
}

.hidden .well {
  height: calc(100vh - 12px);
}

.file-select {
  position: absolute;
  left: 5%;
  top: 17px;
  margin-left: 20px;
}

.banner div {
  color: #000;
}

.banner h1 {
  font-size: 20px;
  line-height: 2;
  margin: 0.5em 0;
}

.well {
  display: block;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  margin: 5px;
  width: calc(100% - 12px);
  height: calc(100vh - 73px);
  overflow: auto;
}

.loading {
  text-align: center;
  padding-top: 50px;
}

.messages .warning {
  color: #cc6600;
}
</style>

<style>
.pptx-wrapper {
  /* max-width: 1000px; */
  margin: 0 auto;
}
</style>
