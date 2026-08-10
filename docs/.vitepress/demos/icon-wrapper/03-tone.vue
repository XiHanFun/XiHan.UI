<!-- 语气 | 换一族颜色只改 tone，形态那一轴一个字不动 -->
<script setup lang="ts">
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"];

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
    { tag: "path", attrs: { d: "M12 3.5L14.7 9.2L21 10.1L16.5 14.5L17.6 20.7L12 17.8L6.4 20.7L7.5 14.5L3 10.1L9.3 9.2Z" } },
  ],
} as const;
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div style="display: flex; align-items: center; gap: 12px">
      <XhIconWrapper v-for="t in tones" :key="t" variant="solid" :tone="t">
        <XhIcon :icon="StarIcon" />
      </XhIconWrapper>
    </div>

    <div style="display: flex; align-items: center; gap: 12px">
      <XhIconWrapper v-for="t in tones" :key="t" variant="subtle" :tone="t">
        <XhIcon :icon="StarIcon" />
      </XhIconWrapper>
    </div>
  </div>
</template>
