<script setup lang="ts">


import { ref } from 'vue'
import VueOfficePdf from '@vue-office/pdf'




const src = ref('https://personalized-edu-1322695558.cos.ap-beijing.myqcloud.com/demo/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0PPT.pdf')


</script>

<template>
    <div>表格</div>
    <!-- <VueOfficeExcel style="height: 100%;" :src="src" /> -->
    <VueOfficePdf style="height: 100%;" :src="src" />
</template>
