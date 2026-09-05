<!-- 相册与翻页 | 多张图共用一个看片浮层：两侧按钮或方向键翻页、计数报「第几张」，缩放旋转在换图时归零 -->
<script setup lang="ts">
import {
  XhImageViewerCloseTrigger,
  XhImageViewerContent,
  XhImageViewerCounter,
  XhImageViewerImage,
  XhImageViewerNextTrigger,
  XhImageViewerPrevTrigger,
  XhImageViewerRoot,
  XhImageViewerToolbar,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
  XhImageViewerZoomOutTrigger,
} from "@xihan-ui/vue";

// 内联的示例图，省得示例依赖外部资源
const items = [
  { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E", alt: "雪山" },
  { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%237c3aed%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%23c4b5fd%22/%3E%3C/svg%3E", alt: "暮色" },
  { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23065f46%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%236ee7b7%22/%3E%3C/svg%3E", alt: "森林" },
];
</script>

<template>
  <XhImageViewerRoot v-slot="{ setIndex, setOpen }" :collection="items">
    <div style="display: flex; gap: 8px">
      <button
        v-for="(item, i) in items"
        :key="item.src"
        type="button"
        style="border: none; padding: 0; cursor: zoom-in; background: none"
        @click="
          setIndex(i);
          setOpen(true);
        "
      >
        <img
          :src="item.src"
          :alt="item.alt"
          style="inline-size: 120px; aspect-ratio: 4/3; object-fit: cover; border-radius: 8px; display: block"
        />
      </button>
    </div>
    <XhImageViewerContent>
      <XhImageViewerViewport>
        <XhImageViewerImage />
      </XhImageViewerViewport>
      <XhImageViewerCounter />
      <XhImageViewerPrevTrigger />
      <XhImageViewerNextTrigger />
      <XhImageViewerToolbar>
        <XhImageViewerZoomOutTrigger />
        <XhImageViewerZoomInTrigger />
      </XhImageViewerToolbar>
      <XhImageViewerCloseTrigger />
    </XhImageViewerContent>
  </XhImageViewerRoot>
</template>
