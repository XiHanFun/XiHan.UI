<!-- 基础用法 | 图片与回退内容始终同挂 DOM、靠 hidden 互斥显隐，换人时盒子不塌也不跳 -->
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

// 内联的示例图，省得示例依赖外部资源
const cover
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";
</script>

<template>
  <!-- 尺寸由这两个自定义属性给：不给就是满宽、高度 auto -->
  <XhImageRoot
    :src="cover"
    alt="示例封面图"
    style="--xh-image-w: 220px; --xh-image-ratio: 16 / 9;"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>
</template>
