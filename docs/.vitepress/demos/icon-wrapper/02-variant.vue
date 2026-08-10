<!-- 形态 | 四种形态只决定底色、描边与前景怎么用，直径与形状一个字不动 -->
<script setup lang="ts">
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"];

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
  nodes: [{ tag: "path", attrs: { d: "M4 12.5L9.5 18L20 6.5" } }],
} as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIconWrapper v-for="v in variants" :key="v" :variant="v">
      <XhIcon :icon="CheckIcon" />
    </XhIconWrapper>
  </div>
</template>
