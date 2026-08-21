const n=`<!-- 尺寸与描边 | size 三档改直径、weight 三档改 stroke-width；缺省档不落 data-* 属性，皮肤的基础规则就是缺省档 -->
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
<\/script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhIcon :icon="StarIcon" size="sm" />
    <XhIcon :icon="StarIcon" />
    <XhIcon :icon="StarIcon" size="lg" />
    <span style="font-size: 13px;">sm / md（缺省）/ lg</span>
  </span>

  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhIcon :icon="StarIcon" size="lg" weight="light" />
    <XhIcon :icon="StarIcon" size="lg" />
    <XhIcon :icon="StarIcon" size="lg" weight="bold" />
    <span style="font-size: 13px;">light / regular（缺省）/ bold</span>
  </span>
</template>
`;export{n as default};
