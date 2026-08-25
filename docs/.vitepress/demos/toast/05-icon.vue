<!-- 图标与自定义排版 | 卡片里排什么由作者定：图标与标题排成一行，标题部件的内容归作者写 -->
<script setup lang="ts">
import { CheckIcon, TriangleAlertIcon, XIcon } from "@xihan-ui/icons";
import { XhIcon, XhToastRoot, XhToastTitle } from "@xihan-ui/vue";

const items = [
  { type: "success", glyph: CheckIcon, title: "发布成功" },
  { type: "warning", glyph: TriangleAlertIcon, title: "配额即将用尽" },
  { type: "error", glyph: XIcon, title: "同步失败" },
] as const;

// 图标只是装饰，读屏念标题就够了
const glyphStyle = {
  display: "grid",
  placeItems: "center",
  flex: "none",
  inlineSize: "20px",
  blockSize: "20px",
  borderRadius: "999px",
  background: "var(--xh-bg-muted)",
  fontSize: "12px",
  lineHeight: "1",
};
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToastRoot
      v-for="item in items"
      :key="item.type"
      :type="item.type"
      :duration="0"
      :closable="false"
    >
      <div style="display: flex; align-items: center; gap: 8px">
        <span aria-hidden="true" :style="glyphStyle"><XhIcon :icon="item.glyph" /></span>
        <XhToastTitle>{{ item.title }}</XhToastTitle>
      </div>
    </XhToastRoot>
  </div>
</template>
