<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/vue";

const article = `先给**结论**：这段正文是一次性渲好的。

- 块列表由渲染器产出
`;
const blocks = createStreamRenderer().render(article, { ended: true }) as readonly MarkdownBlock[];
</script>

<template>
  <XhMarkdownStreamRoot :blocks="blocks" style="inline-size: 240px; font-size: 13px">
    <XhMarkdownStreamContent />
  </XhMarkdownStreamRoot>
</template>
