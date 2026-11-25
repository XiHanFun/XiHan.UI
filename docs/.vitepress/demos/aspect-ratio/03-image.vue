<!-- 放图片 | 直接放进去的图片铺满盒子并按 cover 裁切：同一张图放进不同比例，都不变形、不留边 -->
<script setup lang="ts">
import { XhAspectRatio } from "@xihan-ui/vue";
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--xh-layout-col-min-sm), 1fr));
      gap: var(--xh-space-3);
      inline-size: 100%;
    "
  >
    <XhAspectRatio>
      <img src="/images/image-cropper-landscape.svg" alt="清晨的山谷与湖泊">
    </XhAspectRatio>
    <XhAspectRatio :ratio="16 / 9">
      <img src="/images/image-cropper-landscape.svg" alt="清晨的山谷与湖泊">
    </XhAspectRatio>
  </div>
</template>
