<!-- 间距档位 | gap 一档管两处：列与列之间、同一列里项与项之间，留白始终对齐 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhMasonry } from "@xihan-ui/vue";

const cardStyle =
  "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;
const gap = ref<(typeof gaps)[number]>("md");

const cards = [
  { label: "甲", height: 80 },
  { label: "乙", height: 120 },
  { label: "丙", height: 60 },
  { label: "丁", height: 100 },
  { label: "戊", height: 90 },
  { label: "己", height: 70 },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 8px">
      <button
        v-for="g in gaps"
        :key="g"
        type="button"
        :aria-pressed="g === gap"
        :style="`padding: 4px 10px; border-radius: var(--xh-radius-sm); border: 1px solid var(--xh-border-default); background: ${g === gap ? 'var(--xh-bg-brand)' : 'transparent'}; color: ${g === gap ? 'var(--xh-fg-on-brand)' : 'var(--xh-fg-default)'}`"
        @click="gap = g"
      >
        {{ g }}
      </button>
    </div>

    <XhMasonry :columns="3" :gap="gap">
      <div
        v-for="c in cards"
        :key="c.label"
        :style="`${cardStyle}; block-size: ${c.height}px`"
      >
        {{ c.label }}
      </div>
    </XhMasonry>
  </div>
</template>
