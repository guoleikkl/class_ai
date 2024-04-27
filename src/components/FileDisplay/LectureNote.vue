<template>
  <div class="common-layout">
    <el-main>讲义</el-main>
  </div>
  <div class="container">
    <div v-show="loading" class="well loading">正在加载中，请耐心等待...</div>
    <div v-show="!loading" class="well" ref="output">dd</div>
  </div>
</template>

<script>
import { getExtend, readBuffer, render } from "@/components/FileDisplay/util";
import { parse } from "qs";
import axios from "axios";

export default {
  name: "LectureNote",
  data() {
    return {
      // 加载状态跟踪
      loading: false,
      // 上个渲染实例
      last: null,
      // 隐藏头部，当基于消息机制渲染，将隐藏
      hidden: false,

    };
  },
  created() {
    // 允许使用预留的消息机制发送二进制数据，必须在url后添加?name=xxx.xxx&from=xxx
    const { from, name } = parse(location.search.substr(1));
    console.log('created被触发')
    console.log(from, name);
    console.log(location.search)
    if (from) {
      console.log("from存在")
      this.handleChange({ target: { files: [new File([], name)] } });
      window.addEventListener("message", (event) => {
        console.log("message事件触发")
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
    console.log('页面加载完毕！');

    this.handleChange();
  },

  methods: {

    async handleChange(e) {
      this.loading = true;
      try {
        console.log("try")
        const response = await axios({
          url: 'http://web-guolei.oss-cn-beijing.aliyuncs.com/LectureNote.docx',
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
      const name = 'LectureNote.docx';
      console.log("name是", name);
      // 取得扩展名
      const extend = getExtend(name);
      console.log("extend是", extend);
      // 输出目的地
      const { output } = this.$refs;
      console.log("output是", output);
      // 生成新的dom
      const node = document.createElement("div");
      console.log("node是", node);
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
  },
};


</script>