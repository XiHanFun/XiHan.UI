const e=`<!-- 禁用与只读 | 禁用把裁切框与把手一起摘出 Tab 序列；只读仍可聚焦、仍念得出来，只是改不动 -->
<script setup lang="ts">
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/vue";

const photo =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E";

const crop = { x: 60, y: 40, width: 240, height: 180 };
const handles = ["nw", "ne", "se", "sw"] as const;
<\/script>

<template>
  <XhImageCropperRoot
    :src="photo"
    alt="只读示例"
    read-only
    :default-value="crop"
    style="inline-size: 240px"
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
  <XhImageCropperRoot
    :src="photo"
    alt="禁用示例"
    disabled
    :default-value="crop"
    style="inline-size: 240px"
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
