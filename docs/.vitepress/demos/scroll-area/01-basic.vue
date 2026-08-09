<!-- 基础用法 | root 要有确定高度，视口才量得出溢出；滚动走的是浏览器原生通路，组件只画滚动条 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const lines = Array.from({ length: 30 }, (_, i) => `第 ${i + 1} 行内容`);
</script>

<template>
  <XhScrollAreaRoot style="block-size: 180px; inline-size: 100%; max-inline-size: 420px">
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 8px 12px">
        <p v-for="line in lines" :key="line" style="margin: 0; line-height: 24px">
          {{ line }}
        </p>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaThumb />
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
