<!-- 带图元的标签 | 根是 inline-flex 且自带间距，图标或头像直接写进默认插槽跟文字并排 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot, XhBadge, XhIcon } from "@xihan-ui/vue";

const CheckIcon = {
  name: "check",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [{ tag: "path", attrs: { d: "M4 12.5L9.5 18L20 6" } }],
} as const;
</script>

<template>
  <!-- 图标取 currentColor，颜色跟着标签的语气走 -->
  <XhBadge variant="subtle" tone="success">
    <XhIcon :icon="CheckIcon" size="sm" />已通过
  </XhBadge>

  <XhBadge variant="outline" tone="info" size="lg">
    <XhIcon :icon="CheckIcon" size="sm" />校验完成
  </XhBadge>

  <!-- 头像缩到跟文字一档：直径与字号各是一个组件令牌 -->
  <XhBadge variant="outline" size="lg">
    <XhAvatarRoot
      src="/images/logo.png"
      alt="曦寒"
      style="--xh-avatar-size: 18px; --xh-avatar-font-size: 10px"
    >
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    曦寒
  </XhBadge>
</template>
