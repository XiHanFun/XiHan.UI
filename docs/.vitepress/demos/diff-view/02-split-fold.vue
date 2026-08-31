<!-- 并排与折叠 | 并排两列都发格子，空的那一侧照发；远离变更的连续上下文折成一格，点开即展开 -->
<script setup lang="ts">
import { computeTextDiff, diffStats } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewViewport } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const before = Array.from({ length: 24 }, (_, i) => `const step${i} = pipeline.at(${i})`).join("\n");
const after = before
  .replace("const step1 = pipeline.at(1)", "const step1 = pipeline.head()")
  .replace("const step22 = pipeline.at(22)", "const step22 = pipeline.tail()");

// contextLines 给大一点，让模型里保住整段上下文，折叠交给组件
const model = computed(() => computeTextDiff(before, after, { contextLines: 24 }));
const stats = computed(() => diffStats(model.value));
const expanded = ref<string[]>([]);
</script>

<template>
  <XhDiffViewRoot v-model:expanded="expanded" :model="model" view="split" :context-lines="3">
    <XhDiffViewHeader>
      <span>src/pipeline.ts</span>
      <span>+{{ stats.added }} −{{ stats.removed }}</span>
    </XhDiffViewHeader>
    <XhDiffViewViewport>
      <XhDiffViewBody />
    </XhDiffViewViewport>
  </XhDiffViewRoot>
</template>
