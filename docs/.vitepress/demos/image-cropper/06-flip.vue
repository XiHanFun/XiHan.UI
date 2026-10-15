<!-- 翻转 | 两颗开关钮各管一条轴，图片与裁切框一起镜像；aria-pressed 报这条轴翻没翻 -->
<script setup lang="ts">
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperFlipTrigger,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/vue";

const handles = ["nw", "ne", "se", "sw"] as const;
// 两颗钮写的字就是它们的读屏名：名字取 translations，与钮上的字给成同一句
const translations = { flipHorizontal: "左右翻转", flipVertical: "上下翻转" };
</script>

<template>
  <XhImageCropperRoot
    src="/images/image-cropper-landscape.svg"
    alt="山谷与湖泊风景图"
    :default-value="{ x: 96, y: 64, width: 448, height: 280 }"
    :min-width="40"
    :translations="translations"
    style="inline-size: min(100%, 420px)"
  >
    <XhImageCropperViewport>
      <XhImageCropperImage />
      <XhImageCropperCropArea>
        <XhImageCropperCropHandle
          v-for="position in handles"
          :key="position"
          :position="position"
        />
      </XhImageCropperCropArea>
    </XhImageCropperViewport>
    <div style="display: flex; gap: var(--xh-space-2); padding-block-start: var(--xh-space-3)">
      <XhImageCropperFlipTrigger axis="horizontal">左右翻转</XhImageCropperFlipTrigger>
      <XhImageCropperFlipTrigger axis="vertical">上下翻转</XhImageCropperFlipTrigger>
    </div>
  </XhImageCropperRoot>
</template>
