<!-- 单栏差异 | 两个入口归一到同一个模型：这里用新旧两版全文算，着色在建模时一次算好 -->
<script setup lang="ts">
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewViewport } from "@xihan-ui/vue";
import { createHighlighter } from "@xihan-ui/code-highlight";
import { computed } from "vue";

const before = `export function clamp(n: number, min: number) {
  return Math.max(n, min)
}`;

const after = `export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}`;

// 着色在建模时一次算好：这里手里有完整文本，跨行的记号才切得准
const model = computed(() =>
  computeTextDiff(before, after, { lang: "typescript", highlighter: createHighlighter() }),
);
</script>

<template>
  <XhDiffViewRoot :model="model">
    <XhDiffViewHeader>src/clamp.ts</XhDiffViewHeader>
    <XhDiffViewViewport>
      <XhDiffViewBody />
    </XhDiffViewViewport>
  </XhDiffViewRoot>
</template>
