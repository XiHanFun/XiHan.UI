<!-- 旋转与翻转 | rotate 只收 90 / 180 / 270 三档，flip 沿横轴或纵轴取反；两者是独立属性，同写即叠加 -->
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

const ArrowIcon = {
  name: "arrow-right",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M4 12h15" } },
    { tag: "path", attrs: { d: "M13 6l6 6-6 6" } },
  ],
} as const;
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhIcon :icon="ArrowIcon" size="lg" />
    <XhIcon :icon="ArrowIcon" size="lg" :rotate="90" />
    <XhIcon :icon="ArrowIcon" size="lg" :rotate="180" />
    <XhIcon :icon="ArrowIcon" size="lg" :rotate="270" />
    <span style="font-size: 13px;">不转 / 90 / 180 / 270</span>
  </span>

  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhIcon :icon="ArrowIcon" size="lg" flip="horizontal" />
    <XhIcon :icon="ArrowIcon" size="lg" flip="vertical" />
    <XhIcon :icon="ArrowIcon" size="lg" flip="both" />
    <XhIcon :icon="ArrowIcon" size="lg" :rotate="90" flip="horizontal" />
    <span style="font-size: 13px;">横轴 / 纵轴 / 两轴 / 转 90 再翻横轴</span>
  </span>
</template>
