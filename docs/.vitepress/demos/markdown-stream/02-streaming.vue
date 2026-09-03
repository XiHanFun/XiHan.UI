<!-- 流式增长 | 只有生长中的那一块每帧重渲，定型的块 key 不变、节点原地留着，选区与滚动位置才保得住 -->
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamLiveRegion, XhMarkdownStreamRoot } from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, shallowRef } from "vue";

const article = `## 增量渲染

每来一批字符只重渲**最后一块**。

前面的块已经冻结，key 不再变化。
`;

const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>([]);
const streaming = shallowRef(true);

let at = 0;
let timer = 0;
const tick = () => {
  at = Math.min(at + 3, article.length);
  const ended = at >= article.length;
  blocks.value = renderer.render(article.slice(0, at), { ended }) as readonly MarkdownBlock[];
  streaming.value = !ended;
  if (!ended) timer = window.setTimeout(tick, 70);
};
// 挂载后才开始追加：<script setup> 顶层在服务端渲染时也执行，那里没有 window
onMounted(tick);

onBeforeUnmount(() => {
  window.clearTimeout(timer);
  renderer.dispose();
});
</script>

<template>
  <!-- announce 开着，写完那一刻在播报区念一句；还在写的时候不念 -->
  <XhMarkdownStreamRoot
    :blocks="blocks"
    :streaming="streaming"
    announce="polite"
    style="inline-size: 100%;"
  >
    <XhMarkdownStreamContent />
    <XhMarkdownStreamLiveRegion />
  </XhMarkdownStreamRoot>
</template>
