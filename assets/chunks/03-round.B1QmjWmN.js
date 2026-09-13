const e=`<!-- 圆形裁切 | 以 1:1 裁切头像 -->
<script setup lang="ts">
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/vue";

const handles = ["nw", "ne", "se", "sw"] as const;
<\/script>

<template>
  <XhImageCropperRoot
    src="/images/image-cropper-landscape.svg"
    alt="山谷与湖泊风景图"
    shape="round"
    :aspect-ratio="1"
    :default-value="{ x: 160, y: 50, width: 320, height: 320 }"
    :min-width="48"
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
`;export{e as default};
