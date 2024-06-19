<template>
    <h3>数字人</h3>
    <video-player :src="videoSrc" poster="posterSrc" :options="videoOptions" />

</template>

<script lang="ts" setup>
import { ref } from 'vue'

const videoSrc = ref('https://personalized-edu-1322695558.cos.ap-beijing.myqcloud.com/demo/video.mp4')
const posterSrc = ref('https://personalized-edu-1322695558.cos.ap-beijing.myqcloud.com/demo/poster.jpg')


const videoOptions = ref({
    // height: 200,
    // width: document.documentElement.clientWidth, //播放器宽度
    playbackRates: [0.7, 1.0, 1.5, 2.0], // 播放速度
    autoplay: false, // 如果true,浏览器准备好时开始回放。
    muted: false, 
    loop: true,
    preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
    language: 'zh-CN',
    //aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
    fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
    notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
    controls: true,
    controlBar: {
        timeDivider: true,
        durationDisplay: true,
        remainingTimeDisplay: false,
        fullscreenToggle: true // 全屏按钮
    }

})


</script>