<script setup lang="ts">
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const items = Array.from({ length: 6 }, (_, i) => `第 ${i + 1} 条`);
</script>

<template>
  <div ref="scrollEl" style="block-size: 150px; inline-size: 220px; overflow: auto; border: 1px solid var(--xh-border-default); border-radius: var(--xh-shape-surface); font-size: 13px">
    <XhInfiniteScrollRoot :target="scrollEl" loading>
      <div v-for="item in items" :key="item" style="padding: 6px 12px">{{ item }}</div>
      <p style="margin: 0; padding: 6px 12px; color: var(--xh-fg-muted)">正在取下一页…</p>
      <XhInfiniteScrollSentinel />
    </XhInfiniteScrollRoot>
  </div>
</template>
