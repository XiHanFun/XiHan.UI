<!-- 向上加载更早的消息 | 视口的滚动事件直接监听：滚到接近顶部就去取上一页，取回来的插在最前面 -->
<script setup lang="ts">
import { ref } from "vue";
import { ArrowDownIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhThreadContent,
  XhThreadRoot,
  XhThreadScrollButton,
  XhThreadViewport,
} from "@xihan-ui/vue";

function makeRange(from: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: from + i,
    text: `第 ${from + i} 条 · 会话记录`,
  }));
}

// 编号越小越早，取历史就是往前减
const earliest = ref(33);
const messages = ref(makeRange(earliest.value, 8));
const loading = ref(false);
const hasMore = ref(true);

// 离顶部不到 48px 就取上一页；不在底部时内容增高会按锚点补偿，读到一半的位置不会被顶走
function onScroll(event: Event): void {
  const el = event.currentTarget as HTMLElement;
  if (el.scrollTop > 48 || loading.value || !hasMore.value)
    return;
  loading.value = true;
  window.setTimeout(() => {
    const size = Math.min(6, earliest.value - 1);
    earliest.value -= size;
    messages.value.unshift(...makeRange(earliest.value, size));
    hasMore.value = earliest.value > 1;
    loading.value = false;
  }, 500);
}
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhThreadRoot style="block-size: 220px">
      <XhThreadViewport @scroll="onScroll">
        <XhThreadContent>
          <p v-if="loading" style="margin: 0">正在取更早的…</p>
          <p v-else-if="!hasMore" style="margin: 0">已经是最早的了</p>
          <p v-for="m in messages" :key="m.id" style="margin: 0">{{ m.text }}</p>
        </XhThreadContent>
      </XhThreadViewport>
      <XhThreadScrollButton><XhIcon :icon="ArrowDownIcon" /> 回到底部</XhThreadScrollButton>
    </XhThreadRoot>

    <span>已加载 {{ messages.length }} 条 · 最早到第 {{ earliest }} 条</span>
  </div>
</template>
