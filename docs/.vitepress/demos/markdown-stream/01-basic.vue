<!-- 基础用法 | 块列表由宿主用流式渲染器得到，组件只按 key 铺开、按种类分流 -->
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/vue";
import { shallowRef } from "vue";

const article = `## 结论

先给**结论**：这段正文是一次性渲好的。

- 块列表由渲染器产出
- 每块带一个稳定的 key
`;

// 渲染器是有状态的，谁持有谁负责：一个实例只喂同一条消息的全文
const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>(
  renderer.render(article, { ended: true }) as readonly MarkdownBlock[],
);
</script>

<template>
  <XhMarkdownStreamRoot :blocks="blocks" style="inline-size: 100%;">
    <XhMarkdownStreamContent />
  </XhMarkdownStreamRoot>
</template>
