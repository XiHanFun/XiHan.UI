const n=`<!-- 语气 | 图标没有底色，语气只落在前景上，取普通背景上表达该语气的那档文字色 -->
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

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
    {
      tag: "path",
      attrs: {
        d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
      },
    },
  ],
} as const;

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
<\/script>

<template>
  <!-- 同一枚图标只换语气：旁边的文字不带语气，对照得出改的只是图标前景 -->
  <span
    v-for="t in tones"
    :key="t"
    style="display: inline-flex; align-items: center; gap: 6px"
  >
    <XhIcon :icon="StarIcon" :tone="t" size="lg" />
    <span style="font-size: 13px">{{ t }}</span>
  </span>
</template>
`;export{n as default};
