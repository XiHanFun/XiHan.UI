<!-- 长行换行与词级差异 | 开 wrap 让长行原地折行；配对的删改行之间再比一次词，只有真正动过的那几段上底色 -->
<script setup lang="ts">
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewSummary, XhDiffViewViewport } from "@xihan-ui/vue";
import { createHighlighter } from "@xihan-ui/code-highlight";
import { computed } from "vue";

const before = `const endpoint = "https://api.example.com/v1/workspaces/{id}/documents?include=revisions&limit=50"
const timeout = 3000
export const client = createClient({ endpoint, timeout })`;

const after = `const endpoint = "https://api.example.com/v2/workspaces/{id}/documents?include=revisions,authors&limit=100"
const timeout = 8000
export const client = createClient({ endpoint, timeout })`;

// 词级差异默认就算，wordDiff: false 可以关掉
const model = computed(() =>
  computeTextDiff(before, after, { lang: "typescript", highlighter: createHighlighter() }),
);
</script>

<template>
  <XhDiffViewRoot :model="model" wrap>
    <XhDiffViewHeader>
      <span>src/client.ts</span>
      <XhDiffViewSummary change="added" />
      <XhDiffViewSummary change="removed" />
    </XhDiffViewHeader>
    <XhDiffViewViewport>
      <XhDiffViewBody />
    </XhDiffViewViewport>
  </XhDiffViewRoot>
</template>
