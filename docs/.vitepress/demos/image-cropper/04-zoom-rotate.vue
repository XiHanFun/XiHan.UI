<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 缩放与旋转 | 使用内置滑块调整视图 -->
<script setup lang="ts">
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperRotateSlider,
  XhImageCropperViewport,
  XhImageCropperZoomSlider,
} from "@xihan-ui/vue";

const handles = ["nw", "ne", "se", "sw"] as const;
</script>

<template>
  <XhImageCropperRoot
    src="/images/image-cropper-landscape.svg"
    alt="山谷与湖泊风景图"
    :default-value="{ x: 96, y: 64, width: 448, height: 280 }"
    :default-zoom="1.25"
    :min-width="40"
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
    <div
      style="display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 8px 12px; padding-block-start: 12px"
    >
      <label for="cropper-zoom">缩放</label>
      <XhImageCropperZoomSlider id="cropper-zoom" />
      <label for="cropper-rotation">旋转</label>
      <XhImageCropperRotateSlider id="cropper-rotation" />
    </div>
  </XhImageCropperRoot>
</template>
