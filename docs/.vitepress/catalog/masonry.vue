<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cards = [
  { title: "快速上手", description: "几分钟渲染第一个组件。" },
  { title: "无头内核", description: "行为与视图分离，三端复用同一套契约。" },
  { title: "令牌", description: "颜色、间距、动效。" },
  { title: "主题", description: "浅色、深色、高对比。" },
];
</script>

<template>
  <XhMasonry :columns="2" gap="sm" style="inline-size: 240px">
    <article
      v-for="card in cards"
      :key="card.title"
      style="padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-size: 12px"
    >
      <strong>{{ card.title }}</strong>
      <p style="margin: 4px 0 0; color: var(--xh-fg-muted)">{{ card.description }}</p>
    </article>
  </XhMasonry>
</template>
