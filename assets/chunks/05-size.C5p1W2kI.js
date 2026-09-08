const n=`<!-- 尺寸 | size 换正文字号与块间距，三档共用同一份块列表 -->
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/vue";
import { shallowRef } from "vue";

const article = \`## 结论

先给**结论**：这段正文是一次性渲好的。
\`;

const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>(
  renderer.render(article, { ended: true }) as readonly MarkdownBlock[],
);
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhMarkdownStreamRoot
      v-for="size in ['sm', 'md', 'lg']"
      :key="size"
      :blocks="blocks"
      :size="size"
      style="inline-size: 100%"
    >
      <XhMarkdownStreamContent />
    </XhMarkdownStreamRoot>
  </div>
</template>
`;export{n as default};
