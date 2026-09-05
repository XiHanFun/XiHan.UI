<!-- 与无限滚动合成一条长列表 | 哨兵摆在内容层之后而不是条目之间：窗口外的条目根本没渲染，摆进去的哨兵永远进不了可视区 -->
<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import {
  XhInfiniteScrollLoadMoreTrigger,
  XhInfiniteScrollRoot,
  XhInfiniteScrollSentinel,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";

const PAGE = 100;
const TOTAL = 400;

const loaded = ref(PAGE);
const loading = ref(false);
const done = ref(false);

// 滚动的是视口那一层，提前量按它算；哨兵在同一层里才量得到自己进没进可视区
const viewport = ref<HTMLElement | null>(null);
function bindViewport(el: unknown): void {
  viewport.value = (el as { $el?: HTMLElement } | null)?.$el ?? null;
}

let timer = 0;
function onLoad(): void {
  if (loading.value || done.value) return;
  loading.value = true;
  timer = window.setTimeout(() => {
    loaded.value = Math.min(loaded.value + PAGE, TOTAL);
    done.value = loaded.value >= TOTAL;
    loading.value = false;
  }, 600);
}

onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems }"
    :count="loaded"
    :estimate-size="36"
    class="composed"
  >
    <XhVirtualizerViewport :ref="bindViewport">
      <XhVirtualizerContent>
        <XhVirtualizerItem
          v-for="item in virtualItems"
          :key="item.key"
          :value="item.index"
          class="composed__row"
        >
          第 {{ item.index + 1 }} 条
        </XhVirtualizerItem>
      </XhVirtualizerContent>

      <!-- 内容层撑的是已取到的这几页的总长，哨兵紧跟其后，正好落在列表末尾 -->
      <XhInfiniteScrollRoot
        :target="viewport"
        :loading="loading"
        :disabled="done"
        class="composed__more"
        @load="onLoad"
      >
        <span v-if="loading">正在取下一页…</span>
        <span v-else-if="done">没有更多了，共 {{ TOTAL }} 条</span>
        <!-- 读屏在虚拟光标模式下不产生滚动事件，这颗按钮是哨兵那条路的键盘等价通路 -->
        <XhInfiniteScrollLoadMoreTrigger v-else>取下一页</XhInfiniteScrollLoadMoreTrigger>
        <XhInfiniteScrollSentinel />
      </XhInfiniteScrollRoot>
    </XhVirtualizerViewport>
  </XhVirtualizerRoot>
</template>

<style scoped>
.composed {
  block-size: 260px;
  inline-size: 100%;
  max-inline-size: 420px;
}

.composed__row {
  display: flex;
  align-items: center;
  block-size: 36px;
  padding-inline: var(--xh-space-3);
  border-block-end: var(--xh-stroke-thin) solid var(--xh-border-subtle);
}

.composed__more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--xh-space-2);
  padding: var(--xh-space-3);
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-sm);
}
</style>
