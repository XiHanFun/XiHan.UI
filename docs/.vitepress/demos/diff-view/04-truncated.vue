<!-- 超长差异的截断提示 | 超过 maxLines 的部分被砍掉，提示条把砍了多少行说给读的人 -->
<script setup lang="ts">
import { computeTextDiff } from "@xihan-ui/headless";
import {
  XhDiffViewBody,
  XhDiffViewHeader,
  XhDiffViewRoot,
  XhDiffViewTruncation,
  XhDiffViewViewport,
} from "@xihan-ui/vue";
import { computed } from "vue";

const before = Array.from({ length: 30 }, (_, i) => `const item${i} = ${i}`).join("\n");
const after = before.replace("const item2 = 2", "const item2 = 200");

// 上限压到 6 行，两侧各砍掉 24 行
const model = computed(() => computeTextDiff(before, after, { maxLines: 6 }));
</script>

<template>
  <XhDiffViewRoot :model="model" :context-lines="2">
    <XhDiffViewHeader>src/items.ts</XhDiffViewHeader>
    <XhDiffViewViewport>
      <XhDiffViewBody />
    </XhDiffViewViewport>
    <!-- 断掉的差异看着仍像一份完整差异，没有这一条读的人会以为自己看完了 -->
    <XhDiffViewTruncation />
  </XhDiffViewRoot>
</template>
