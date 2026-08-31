<!-- 流式光标 | 一块都还没来的时候光标就已经在了，caret 设成 false 可以整个关掉 -->
<script setup lang="ts">
import type { MarkdownBlock } from "@xihan-ui/headless";
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from "@xihan-ui/vue";

// 生长中的那一块 key 恒为 live，光标画在它末尾
const growing: readonly MarkdownBlock[] = [
  { key: "live", kind: "markdown", html: "<p>正在写的这一句。</p>", complete: false },
];

const cases: { label: string; blocks: readonly MarkdownBlock[]; caret: boolean }[] = [
  { label: "等第一个字：块列表还是空的", blocks: [], caret: true },
  { label: "正在出字：光标停在生长块末尾", blocks: growing, caret: true },
  { label: "caret 设成 false：一竖都不画", blocks: growing, caret: false },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div v-for="item in cases" :key="item.label">
      <p>{{ item.label }}</p>
      <XhMarkdownStreamRoot :blocks="item.blocks" :caret="item.caret" streaming>
        <XhMarkdownStreamContent />
      </XhMarkdownStreamRoot>
    </div>
  </div>
</template>
