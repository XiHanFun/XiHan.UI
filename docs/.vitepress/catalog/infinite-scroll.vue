<script setup lang="ts">
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const items = Array.from({ length: 6 }, (_, i) => `第 ${i + 1} 条`);
</script>

<template>
  <div ref="scrollEl" data-xh-scroll style="block-size: var(--xh-doc-catalog-h); inline-size: var(--xh-doc-catalog-w); overflow: auto; border: var(--xh-stroke-thin) solid var(--xh-border-default); border-radius: var(--xh-shape-surface)">
    <XhInfiniteScrollRoot :target="scrollEl" loading>
      <div v-for="item in items" :key="item" style="padding: var(--xh-space-1_5) var(--xh-space-3)">{{ item }}</div>
      <div style="padding: var(--xh-space-1_5) var(--xh-space-3); color: var(--xh-fg-muted)">正在取下一页…</div>
      <XhInfiniteScrollSentinel />
    </XhInfiniteScrollRoot>
  </div>
</template>
