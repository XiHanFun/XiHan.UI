<!-- 禁用 | 禁用后不可调整 -->
<script setup lang="ts">
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/vue";

const crop = { x: 96, y: 64, width: 448, height: 280 };
const handles = ["nw", "ne", "se", "sw"] as const;
</script>

<template>
  <XhImageCropperRoot
    src="/images/image-cropper-landscape.svg"
    alt="山谷与湖泊风景图"
    disabled
    :default-value="crop"
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
  </XhImageCropperRoot>
</template>
