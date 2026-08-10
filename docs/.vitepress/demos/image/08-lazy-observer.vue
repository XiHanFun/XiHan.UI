<!-- 自己决定何时取图 | src 是响应式的：进入视口前不给地址，观察器命中再换上，机器立刻走一遍完整加载 -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

const remote
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%23334155%22/%3E%3Crect%20x=%220.4%22%20y=%220.4%22%20width=%223.2%22%20height=%221%22%20fill=%22%2360a5fa%22/%3E%3Crect%20x=%220.4%22%20y=%221.8%22%20width=%222%22%20height=%220.8%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";

const viewport = ref<HTMLElement | null>(null);
const host = ref<HTMLElement | null>(null);
const src = ref<string | undefined>(undefined);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!host.value)
    return;
  // 观察器的三个参数都在这里定：拿哪个盒子当视口、提前多远开始取、露出几成算数
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some(entry => entry.isIntersecting))
        return;
      src.value = remote;
      observer?.disconnect();
    },
    { root: viewport.value, rootMargin: "24px", threshold: 0.1 },
  );
  observer.observe(host.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div
    ref="viewport"
    style="
      inline-size: 260px;
      block-size: 180px;
      overflow-y: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <p style="margin: 0 0 12px">往下滚，图片进视口才开始取。</p>
    <div style="block-size: 200px" />

    <div ref="host">
      <!-- 还没给地址时落的是无来源那一态，回退部件正好当占位 -->
      <XhImageRoot
        :src="src"
        alt="报表截图"
        style="--xh-image-w: 100%; --xh-image-ratio: 4 / 3"
      >
        <XhImageImage />
        <XhImageFallback>{{ src ? "加载中" : "还没开始取" }}</XhImageFallback>
      </XhImageRoot>
    </div>
  </div>
</template>
