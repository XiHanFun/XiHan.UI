<!-- 受控 | 传了 value 就由宿主说了算：组件只发变更意图，写回去之后框才动 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/vue";

const photo =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E";

const rect = ref({ x: 60, y: 40, width: 240, height: 180 });
const handles = ["nw", "ne", "se", "sw"] as const;
</script>

<template>
  <XhImageCropperRoot
    v-model:value="rect"
    :src="photo"
    :min-width="40"
    style="inline-size: 360px"
  >
    <XhImageCropperViewport>
      <XhImageCropperImage alt="示例图片" />
      <XhImageCropperCropArea>
        <XhImageCropperCropHandle
          v-for="position in handles"
          :key="position"
          :position="position"
        />
      </XhImageCropperCropArea>
    </XhImageCropperViewport>
  </XhImageCropperRoot>
  <span>
    裁切矩形：{{ rect.x }},{{ rect.y }} · {{ rect.width }}×{{ rect.height }}
  </span>
  <button
    type="button"
    @click="rect = { x: 60, y: 40, width: 240, height: 180 }"
  >
    复位
  </button>
</template>
