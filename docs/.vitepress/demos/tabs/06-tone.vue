<!-- 语气 | tone 决定选中态用哪族颜色，与 variant 正交；这里固定 card 形态只看语气的差别 -->
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 每族一套标签，选中那张的文本带上语气名
const groups = tones.map((tone) => ({
  tone,
  tabs: [
    { value: "selected", label: `${tone}（选中）` },
    { value: "other", label: "未选" },
  ],
}));

const panels: Record<string, string> = {
  selected: "选中面板",
  other: "另一个面板",
};
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; inline-size: 100%">
    <XhTabsRoot
      v-for="g in groups"
      :key="g.tone"
      variant="card"
      :tone="g.tone"
      :collection="g.tabs"
      default-value="selected"
      style="inline-size: 100%"
    >
      <template #panel="node">{{ panels[node.value] }}</template>
    </XhTabsRoot>
  </div>
</template>
