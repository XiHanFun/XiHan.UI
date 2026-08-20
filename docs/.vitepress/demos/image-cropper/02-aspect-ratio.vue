<!-- 锁定宽高比 | 给了 aspectRatio，拉角由位移更大的那条轴驱动、另一条边跟着算，产出比例恒定 -->
<script setup lang="ts">
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperGrid,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/vue";

const photo =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E";

const handles = ["nw", "ne", "se", "sw"] as const;
</script>

<template>
  <!-- 16:9 的封面图：只放四个角的把手，边上的把手在锁比例时能做的事一样 -->
  <XhImageCropperRoot
    :src="photo"
    alt="示例图片"
    :aspect-ratio="16 / 9"
    :min-width="80"
    style="inline-size: 360px"
  >
    <XhImageCropperViewport>
      <XhImageCropperImage />
      <XhImageCropperCropArea>
        <XhImageCropperGrid />
        <XhImageCropperCropHandle
          v-for="position in handles"
          :key="position"
          :position="position"
        />
      </XhImageCropperCropArea>
    </XhImageCropperViewport>
  </XhImageCropperRoot>
</template>
