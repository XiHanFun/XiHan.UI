<script setup lang="ts">
import { XhImageCropperCropArea, XhImageCropperCropHandle, XhImageCropperGrid, XhImageCropperImage, XhImageCropperRoot, XhImageCropperViewport } from "@xihan-ui/vue";

const handles = ["nw", "ne", "se", "sw"] as const;
</script>

<template>
  <XhImageCropperRoot
    src="/images/image-cropper-landscape.svg"
    alt="山谷与湖泊风景图"
    :default-value="{ x: 96, y: 64, width: 448, height: 280 }"
    style="inline-size: 240px"
  >
    <XhImageCropperViewport>
      <XhImageCropperImage />
      <XhImageCropperCropArea>
        <XhImageCropperGrid />
        <XhImageCropperCropHandle v-for="position in handles" :key="position" :position="position" />
      </XhImageCropperCropArea>
    </XhImageCropperViewport>
  </XhImageCropperRoot>
</template>
