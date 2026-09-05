<!-- 向上加载更早的消息 | 视口的滚动事件直接监听：滚到接近顶部就去取上一页，取回来的插在最前面，读到一半的位置不会被顶走 -->
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

function makeRange(from: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `m${from + i}`,
    text: `第 ${from + i} 条 · 会话记录`,
  }));
}

// 编号越小越早，取历史就是往前减
const earliest = ref(33);
const messages = ref(makeRange(earliest.value, 8));
const loading = ref(false);
const hasMore = ref(true);

// 离顶部不到 48px 就取上一页；条目是 list 的直接子节点，内容增高时滚动位置按锚点补偿
function onScroll(event: Event): void {
  const el = event.currentTarget as HTMLElement;
  if (el.scrollTop > 48 || loading.value || !hasMore.value) return;
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
  <div style="display: grid; gap: 12px">
    <XhMessageFeedRoot :count="messages.length" style="block-size: 220px;">
      <XhMessageFeedViewport @scroll="onScroll">
        <XhMessageFeedList>
          <XhMessageFeedItem
            v-for="(message, index) in messages"
            :key="message.id"
            :item-id="message.id"
            :item-index="index"
            item-role="assistant"
          >
            {{ message.text }}
          </XhMessageFeedItem>
        </XhMessageFeedList>
      </XhMessageFeedViewport>
      <XhMessageFeedScrollToEndTrigger />
    </XhMessageFeedRoot>

    <span>
      已加载 {{ messages.length }} 条 · 最早到第 {{ earliest }} 条
      <template v-if="loading">· 正在取更早的…</template>
      <template v-else-if="!hasMore">· 已经是最早的了</template>
    </span>
  </div>
</template>
