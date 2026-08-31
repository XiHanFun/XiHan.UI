<!-- 代码块交给代码视图 | markdown 块铺 html，代码块拿 source 交出去——照 html 渲会让同一段代码出现两次 -->
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import {
  XhCodeViewCode,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhMarkdownStreamContent,
  XhMarkdownStreamRoot,
} from "@xihan-ui/vue";
import { shallowRef } from "vue";

const article = `先看这段实现：

\`\`\`typescript
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
\`\`\`

两端都夹住，越界的输入不会漏过去。
`;

const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>(
  renderer.render(article, { ended: true }) as readonly MarkdownBlock[],
);
</script>

<template>
  <XhMarkdownStreamRoot :blocks="blocks" style="inline-size: 100%;">
    <XhMarkdownStreamContent>
      <!-- 只接管代码块，其余块留给组件按 html 铺 -->
      <template #block="{ block }">
        <XhCodeViewRoot
          v-if="block.kind === 'code'"
          :code="block.source ?? ''"
          :lang="block.lang"
          :complete="block.complete"
          line-numbers
        >
          <XhCodeViewPre>
            <XhCodeViewCode />
          </XhCodeViewPre>
        </XhCodeViewRoot>
        <div v-else v-html="block.html" />
      </template>
    </XhMarkdownStreamContent>
  </XhMarkdownStreamRoot>
</template>
