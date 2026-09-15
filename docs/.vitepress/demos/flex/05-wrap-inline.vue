<!-- 换行与行内 | 换行排列或随文字排布 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const tags = [
  { id: 1, tone: "brand", width: "56px" },
  { id: 2, tone: "info", width: "72px" },
  { id: 3, tone: "success", width: "64px" },
  { id: 4, tone: "warning", width: "80px" },
  { id: 5, tone: "danger", width: "68px" },
] as const;
</script>

<template>
  <XhFlex orientation="vertical" gap="lg">
    <XhFlex wrap gap="sm" style="max-inline-size: 280px">
      <span
        v-for="tag in tags"
        :key="tag.id"
        data-demo-block
        :data-tone="tag.tone"
        :style="{ '--xh-demo-block-inline-size': tag.width, '--xh-demo-block-block-size': '24px', '--xh-demo-block-radius': 'var(--xh-shape-pill)' }"
      />
    </XhFlex>
    <XhFlex inline gap="xs" aria-label="行内占位区块">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-inline-size: 68px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)" />
      <span data-demo-block data-tone="success" style="--xh-demo-block-inline-size: 60px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)" />
    </XhFlex>
  </XhFlex>
</template>
