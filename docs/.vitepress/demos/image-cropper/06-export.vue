<!-- 导出裁切结果 | 出图不归组件管：拿 getCropRect() 的矩形喂给 cropToCanvas，画出来的是一张新画布 -->
<script setup lang="ts">
import { ref } from "vue";
import { cropToCanvas } from "@xihan-ui/headless";
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/vue";

const photo =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E";

const preview = ref<HTMLElement | null>(null);
const handles = ["nw", "ne", "se", "sw"] as const;

function exportCrop(rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const image = document.querySelector<HTMLImageElement>(
    '#cropper-export img[data-part="image"]',
  );
  if (!image || !preview.value) return;
  // 出图只在点确认时做一次：拖动途中每帧都出图会把主线程占满
  const canvas = cropToCanvas(image, rect, { width: 160 });
  if (canvas) preview.value.replaceChildren(canvas);
}
</script>

<template>
  <XhImageCropperRoot
    id="cropper-export"
    v-slot="{ getCropRect }"
    :src="photo"
    alt="示例图片"
    :min-width="40"
    style="inline-size: 360px"
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
    <button type="button" @click="exportCrop(getCropRect())">导出这一块</button>
  </XhImageCropperRoot>
  <div ref="preview" style="min-block-size: 40px"></div>
</template>
