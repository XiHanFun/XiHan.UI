<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cards = [
  { id: "a", tone: "brand", height: "52px" },
  { id: "b", tone: "success", height: "76px" },
  { id: "c", tone: "warning", height: "64px" },
  { id: "d", tone: "info", height: "72px" },
] as const;
</script>

<template>
  <XhMasonry :columns="2" gap="sm" style="inline-size: var(--xh-doc-catalog-w)">
    <article
      v-for="card in cards"
      :key="card.id"
      data-demo-block
      :data-tone="card.tone"
      aria-hidden="true"
      :style="{ '--xh-demo-block-block-size': card.height }"
    />
  </XhMasonry>
</template>
