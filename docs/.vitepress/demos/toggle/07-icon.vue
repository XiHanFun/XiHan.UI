<!-- 图标 | 按钮内容随便写，图标与文字之间的空隙由 --xh-toggle-gap 给；只放图标时按钮没有可见文字，名字得由 aria-label 补上 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhIcon, XhToggle } from "@xihan-ui/vue";

const StarIcon = {
  name: "star",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 4L14.4 8.9L19.8 9.7L15.9 13.5L16.8 18.9L12 16.4L7.2 18.9L8.1 13.5L4.2 9.7L9.6 8.9Z" } },
  ],
} as const;

const EyeIcon = {
  name: "eye",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M2 12C4.7 7.7 8 5.5 12 5.5C16 5.5 19.3 7.7 22 12C19.3 16.3 16 18.5 12 18.5C8 18.5 4.7 16.3 2 12Z" } },
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "3" } },
  ],
} as const;

const starred = ref(false);
</script>

<template>
  <!-- 图标配文字：文字自己说清楚这颗按钮是干什么的，图标不必再给名字 -->
  <XhToggle v-model:pressed="starred" variant="outline">
    <XhIcon :icon="StarIcon" />{{ starred ? "已收藏" : "收藏" }}
  </XhToggle>

  <!-- 只放图标：内边距收窄成方形，名字由 aria-label 给 -->
  <XhToggle
    variant="outline"
    aria-label="显示预览"
    style="--xh-toggle-px: var(--xh-space-2);"
  >
    <XhIcon :icon="EyeIcon" />
  </XhToggle>
</template>
