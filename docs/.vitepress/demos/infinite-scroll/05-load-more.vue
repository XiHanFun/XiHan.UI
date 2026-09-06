<!-- 取下一页的按钮 | 与哨兵同一条通路：读屏在虚拟光标模式下不产生滚动事件，这颗按钮是它的键盘等价入口 -->
<script setup lang="ts">
import {
  XhInfiniteScrollLoadMoreTrigger,
  XhInfiniteScrollRoot,
  XhInfiniteScrollSentinel,
} from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const items = ref(Array.from({ length: 10 }, (_, i) => `第 ${i + 1} 条`));
const loading = ref(false);

// 取下一页；这里用定时器代替真实请求
function onLoad(): void {
  loading.value = true;
  window.setTimeout(() => {
    const base = items.value.length;
    for (let i = 1; i <= 6; i += 1) items.value.push(`第 ${base + i} 条`);
    loading.value = false;
  }, 500);
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
    <XhInfiniteScrollRoot :target="scrollEl" :loading="loading" @load="onLoad">
      <div v-for="item in items" :key="item" style="padding: 8px 12px">{{ item }}</div>
      <XhInfiniteScrollSentinel />
      <!-- 文案写在按钮里：组件不代填名字，读屏念的与眼睛看的是同一句 -->
      <div style="display: flex; justify-content: center; padding: 8px 12px">
        <XhInfiniteScrollLoadMoreTrigger>
          {{ loading ? "正在取下一页…" : "加载更多" }}
        </XhInfiniteScrollLoadMoreTrigger>
      </div>
    </XhInfiniteScrollRoot>
  </div>
</template>
