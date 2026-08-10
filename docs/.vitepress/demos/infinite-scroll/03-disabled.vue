<!-- 取到没有了 | 最后一页取完把 disabled 打开，哨兵不再被观察，load 也不再派 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
const maxPage = 3;
const page = ref(1);
const items = ref(Array.from({ length: 10 }, (_, i) => `第 ${i + 1} 条`));
const loading = ref(false);

function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 6; i += 1) items.value.push(`第 ${base + i} 条`);
    page.value += 1;
    loading.value = false;
  }, 400);
}
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div
      ref="scrollEl"
      style="
        block-size: 220px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <XhInfiniteScrollRoot
        :target="scrollEl"
        :loading="loading"
        :disabled="page >= maxPage"
        @load="onLoad"
      >
        <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>
        <p v-if="loading" style="margin: 0; padding: 8px 12px; color: var(--xh-fg-muted)">
          正在取下一页…
        </p>
        <p v-else-if="page >= maxPage" style="margin: 0; padding: 8px 12px; color: var(--xh-fg-muted)">
          没有更多了
        </p>
        <XhInfiniteScrollSentinel />
      </XhInfiniteScrollRoot>
    </div>

    <span>第 {{ page }} / {{ maxPage }} 页 · 共 {{ items.length }} 条</span>
  </div>
</template>
