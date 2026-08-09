<!-- 尺寸与裁切 | 同一个组件既当封面图也当缩略图：宽高比由 --xh-image-ratio 定，画面怎么填由 --xh-image-fit 定 -->
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

// 竖幅素材，放进方形盒子里才看得出 cover 与 contain 的差别
const portrait
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%203%204%22%3E%3Crect%20width=%223%22%20height=%224%22%20fill=%22%230f766e%22/%3E%3Ccircle%20cx=%221.5%22%20cy=%221.4%22%20r=%220.7%22%20fill=%22%235eead4%22/%3E%3C/svg%3E";
</script>

<template>
  <XhImageRoot
    :src="portrait"
    alt="裁掉多余部分"
    style="--xh-image-w: 120px; --xh-image-ratio: 1; --xh-image-fit: cover;"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <XhImageRoot
    :src="portrait"
    alt="整幅装进去"
    style="--xh-image-w: 120px; --xh-image-ratio: 1; --xh-image-fit: contain;"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <!-- 圆形缩略图：圆角也是一个变量，不必另建一个组件 -->
  <XhImageRoot
    :src="portrait"
    alt="圆形缩略图"
    style="--xh-image-w: 64px; --xh-image-ratio: 1; --xh-image-radius: 50%;"
  >
    <XhImageImage />
    <XhImageFallback>无</XhImageFallback>
  </XhImageRoot>

  <span style="font-size: 13px;">cover（裁切）· contain（留边）· 圆形缩略图</span>
</template>
