<!-- 默认插槽透出状态 | phase / loading / disabled 从插槽拿，加载提示与结束语都由宿主自己摆 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
const items = ref(Array.from({ length: 10 }, (_, i) => `第 ${i + 1} 条`));
const loading = ref(false);
const done = ref(false);

function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 6; i += 1) items.value.push(`第 ${base + i} 条`);
    done.value = items.value.length >= 28;
    loading.value = false;
  }, 400);
}
</script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 240px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <XhInfiniteScrollRoot
      v-slot="{ phase, loading: busy, disabled }"
      :target="scrollEl"
      :loading="loading"
      :disabled="done"
      @load="onLoad"
    >
      <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>

      <p style="margin: 0; padding: 8px 12px; color: var(--xh-fg-muted)">
        <template v-if="busy">正在取下一页…</template>
        <template v-else-if="disabled">没有更多了</template>
        <template v-else>继续往下滚（当前 {{ phase }}）</template>
      </p>

      <XhInfiniteScrollSentinel />
    </XhInfiniteScrollRoot>
  </div>
</template>
