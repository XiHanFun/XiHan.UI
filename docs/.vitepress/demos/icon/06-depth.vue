<!-- 前景分级 | 图标没有底色，前景是一个组件令牌；跟正文取同一族文字色，图标就跟着排出主次 -->
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

const InfoIcon = {
  name: "info",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
    { tag: "path", attrs: { d: "M12 11V16.5" } },
    { tag: "path", attrs: { d: "M12 7.5V8" } },
  ],
} as const;

// 前景取普通背景上的四档文字色，从正文一路淡到不可用
const depths = [
  { fg: "var(--xh-fg-default)", label: "正文" },
  { fg: "var(--xh-fg-muted)", label: "次要" },
  { fg: "var(--xh-fg-subtle)", label: "更次要" },
  { fg: "var(--xh-fg-disabled)", label: "不可用" },
];
</script>

<template>
  <span
    v-for="d in depths"
    :key="d.label"
    :style="{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: d.fg }"
  >
    <XhIcon :icon="InfoIcon" size="lg" :style="{ '--xh-icon-fg': d.fg }" />
    <span style="font-size: 13px">{{ d.label }}</span>
  </span>
</template>
