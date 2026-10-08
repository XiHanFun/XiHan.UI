var e=`<!-- 导出裁切结果 | toCanvas 按所见出图：裁切矩形、旋转、翻转与圆形外形一并生效 -->
<script setup lang="ts">
import {
  XhButton,
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperRotateSlider,
  XhImageCropperViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const handles = ["nw", "ne", "se", "sw"] as const;
const avatar = ref("");

// 在确认时出图一次，不要在每次拖动时出图
function exportAvatar(toCanvas: (options?: { width?: number }) => HTMLCanvasElement | null) {
  avatar.value = toCanvas({ width: 96 })?.toDataURL("image/png") ?? "";
}
<\/script>

<template>
  <XhImageCropperRoot
    v-slot="{ toCanvas }"
    src="/images/image-cropper-landscape.svg"
    alt="山谷与湖泊风景图"
    shape="round"
    :aspect-ratio="1"
    :default-value="{ x: 160, y: 50, width: 320, height: 320 }"
    :default-rotation="90"
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
    <XhImageCropperRotateSlider aria-label="旋转" />
    <div style="display: flex; gap: var(--xh-space-3); align-items: center; padding-block-start: var(--xh-space-3)">
      <XhButton @click="exportAvatar(toCanvas)">导出头像</XhButton>
      <img v-if="avatar" :src="avatar" alt="导出的头像" width="48" height="48">
    </div>
  </XhImageCropperRoot>
</template>
`;export{e as default};