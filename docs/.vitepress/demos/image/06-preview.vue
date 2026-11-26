<!-- 点击查看大图 | 写上 preview，图片就是一颗打开大图预览的按钮：点击或聚焦后按 Enter / Space 打开，预览层里可以缩放、旋转与翻转，关上后焦点回到图片 -->
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhImageRoot
    src="/images/image-cropper-landscape.svg"
    alt="清晨的山谷与湖泊"
    preview
    style="--xh-image-w: 200px; --xh-image-ratio: 3 / 2;"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>
</template>
