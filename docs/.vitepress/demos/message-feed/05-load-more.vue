<!-- 触底加载更多 | stick-change 报到底，宿主据此去取下一页；先往上翻一段再滚回底部，取回来的消息接在后面 -->
<script setup lang="ts">
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const maxPage = 3;
const messages = ref(
  Array.from({ length: 8 }, (_, i) => ({
    id: `m${i + 1}`,
    text: `第 ${i + 1} 条 · 先往上翻一段，再滚回底部`,
  })),
);
const page = ref(1);
const loading = ref(false);

// 到了底、手上没在取、还有下一页，三条都满足才发起这一次加载
function onStickChange(details: { atBottom: boolean; sticking: boolean }): void {
  if (!details.atBottom || loading.value || page.value >= maxPage) return;
  loading.value = true;
  window.setTimeout(() => {
    page.value += 1;
    const base = messages.value.length;
    for (let i = 1; i <= 4; i += 1) {
      messages.value.push({
        id: `m${base + i}`,
        text: `第 ${base + i} 条 · 第 ${page.value} 页取回来的`,
      });
    }
    loading.value = false;
  }, 600);
}
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 提示行不是消息，摆在列表外面：条目必须是 list 的直接子节点 -->
    <XhMessageFeedRoot
      :count="messages.length"
      style="block-size: 220px;"
      @stick-change="onStickChange"
    >
      <XhMessageFeedViewport>
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
      已加载 {{ messages.length }} 条 · 第 {{ page }} / {{ maxPage }} 页
      <template v-if="loading">· 正在取下一页…</template>
      <template v-else-if="page >= maxPage">· 没有更多了</template>
    </span>
  </div>
</template>
