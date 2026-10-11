var e=`<!-- 没有更多数据 | 最后一页取完后开启 disabled，哨兵不再被观察，load 也不再派发 -->
<script setup lang="ts">
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const maxPage = 3;
const page = ref(1);
const items = ref(Array.from({ length: 10 }, (_, i) => \`第 \${i + 1} 条\`));
const loading = ref(false);

function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 6; i += 1) items.value.push(\`第 \${base + i} 条\`);
    page.value += 1;
    loading.value = false;
  }, 400);
}
<\/script>

<template>
  <div
    ref="scrollEl"
    data-xh-scroll
    style="
      inline-size: 100%;
      block-size: 220px;
      overflow: auto;
      border: var(--xh-stroke-thin) solid var(--xh-border-default);
      border-radius: var(--xh-shape-surface);
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

  <span data-demo-output>第 {{ page }} / {{ maxPage }} 页 · 共 {{ items.length }} 条</span>
</template>
`;export{e as default};