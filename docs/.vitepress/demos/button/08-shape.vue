<!-- 形状与图标按钮 | 圆角是一个组件令牌；只放一枚图元时把左右内边距收成 0、宽度取控件档位，名字这时只能由 aria-label 给 -->
<script setup lang="ts">
import { XhButton, XhIcon } from "@xihan-ui/vue";

const SearchIcon = {
  name: "search",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "10.5", cy: "10.5", r: "6.5" } },
    { tag: "path", attrs: { d: "M15.5 15.5L20.5 20.5" } },
  ],
} as const;
</script>

<template>
  <XhButton variant="solid">直角</XhButton>

  <!-- 胶囊：只改圆角这一个槽位 -->
  <XhButton variant="solid" style="--xh-button-radius: var(--xh-shape-pill)">胶囊</XhButton>

  <!-- 方形图标按钮 -->
  <XhButton
    variant="outline"
    aria-label="搜索"
    style="--xh-button-px: 0; inline-size: var(--xh-control-h-md)"
  >
    <XhIcon :icon="SearchIcon" size="sm" />
  </XhButton>

  <!-- 圆形图标按钮：方形再叠上胶囊圆角 -->
  <XhButton
    variant="solid"
    aria-label="搜索"
    style="--xh-button-px: 0; --xh-button-radius: var(--xh-shape-pill); inline-size: var(--xh-control-h-md)"
  >
    <XhIcon :icon="SearchIcon" size="sm" />
  </XhButton>
</template>
