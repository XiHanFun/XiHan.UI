<!-- 逐列填 | 打开 sequential 后项按文档序成段落进各列，读起来是「先走完左列，再走下一列」 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cardStyle =
  "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const cards = [
  { label: "1", height: 70 },
  { label: "2", height: 120 },
  { label: "3", height: 60 },
  { label: "4", height: 100 },
  { label: "5", height: 80 },
  { label: "6", height: 110 },
];
</script>

<template>
  <XhMasonry :columns="3" gap="md" sequential>
    <div
      v-for="c in cards"
      :key="c.label"
      :style="`${cardStyle}; block-size: ${c.height}px`"
    >
      {{ c.label }}
    </div>
  </XhMasonry>
</template>
