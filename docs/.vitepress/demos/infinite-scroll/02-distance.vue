<!-- 提前量 | distance 把可视区沿块轴向外扩，哨兵还没露头就先取下一页 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
const distance = ref(200);
const items = ref(Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 条`));
const loading = ref(false);
const rounds = ref(0);

function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 8; i += 1) items.value.push(`第 ${base + i} 条`);
    rounds.value += 1;
    loading.value = false;
  }, 400);
}
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <label style="display: flex; align-items: center; gap: 8px">
      提前
      <input v-model.number="distance" type="range" min="0" max="400" step="50" />
      {{ distance }}px 触发 · 已取 {{ rounds }} 页
    </label>

    <div
      ref="scrollEl"
      style="
        block-size: 220px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <!-- 提前量扩的是 target 那块可视区，容器滚动必须把容器交出来 -->
      <XhInfiniteScrollRoot
        :target="scrollEl"
        :distance="distance"
        :loading="loading"
        @load="onLoad"
      >
        <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>
        <XhInfiniteScrollSentinel />
      </XhInfiniteScrollRoot>
    </div>
  </div>
</template>
