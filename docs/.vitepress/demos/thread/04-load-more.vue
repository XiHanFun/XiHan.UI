<!-- 触底加载更多 | stick-change 报到底，宿主据此去取下一页；先往上滚一段再滚回底部，取回来的消息追加在后面 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhThreadContent,
  XhThreadRoot,
  XhThreadScrollButton,
  XhThreadViewport,
} from "@xihan-ui/vue";

const maxPage = 3;
const messages = ref(
  Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    text: `第 ${i + 1} 条 · 先往上滚一段，再滚回底部`,
  })),
);
const page = ref(1);
const loading = ref(false);

// 到了底、手上没在取、还有下一页，三条都满足才发起这一次加载
function onStickChange(details: { atBottom: boolean; sticking: boolean }): void {
  if (!details.atBottom || loading.value || page.value >= maxPage)
    return;
  loading.value = true;
  window.setTimeout(() => {
    page.value += 1;
    const base = messages.value.length;
    for (let i = 1; i <= 4; i += 1) {
      messages.value.push({
        id: base + i,
        text: `第 ${base + i} 条 · 第 ${page.value} 页取回来的`,
      });
    }
    loading.value = false;
  }, 600);
}
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhThreadRoot style="block-size: 220px" @stick-change="onStickChange">
      <XhThreadViewport>
        <XhThreadContent>
          <p v-for="m in messages" :key="m.id" style="margin: 0">{{ m.text }}</p>
          <p v-if="loading" style="margin: 0">正在取下一页…</p>
          <p v-else-if="page >= maxPage" style="margin: 0">没有更多了</p>
        </XhThreadContent>
      </XhThreadViewport>
      <XhThreadScrollButton />
    </XhThreadRoot>

    <span>已加载 {{ messages.length }} 条 · 第 {{ page }} / {{ maxPage }} 页</span>
  </div>
</template>
