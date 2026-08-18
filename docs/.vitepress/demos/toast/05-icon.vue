<!-- 图标与自定义排版 | 卡片里排什么由作者定：图标与标题排成一行，标题、描述两个部件的内容都归作者写 -->
<script setup lang="ts">
import {
  XhToastDescription,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";

const items = [
  {
    type: "success",
    glyph: "✓",
    title: "发布成功",
    description: "文档已对所有人可见",
  },
  {
    type: "warning",
    glyph: "!",
    title: "配额即将用尽",
    description: "本月还剩 8% 额度",
  },
  {
    type: "error",
    glyph: "✕",
    title: "同步失败",
    description: "网络中断，稍后自动重试",
  },
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
        <span aria-hidden="true" :style="glyphStyle">{{ item.glyph }}</span>
        <XhToastTitle>{{ item.title }}</XhToastTitle>
      </div>
      <XhToastDescription>{{ item.description }}</XhToastDescription>
    </XhToastRoot>
  </div>
</template>
