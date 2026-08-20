<!-- 基础用法 | 等宽不等高的项按最短列优先落进三列，底边尽量齐平 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cardStyle =
  "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const cards = [
  { label: "甲", height: 90 },
  { label: "乙", height: 140 },
  { label: "丙", height: 60 },
  { label: "丁", height: 110 },
  { label: "戊", height: 70 },
  { label: "己", height: 150 },
];
</script>

<template>
  <XhMasonry :columns="3" gap="md">
    <div
      v-for="c in cards"
      :key="c.label"
      :style="`${cardStyle}; block-size: ${c.height}px`"
    >
      {{ c.label }}
    </div>
  </XhMasonry>
</template>
