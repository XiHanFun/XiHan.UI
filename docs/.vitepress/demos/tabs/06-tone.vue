<!-- 语气 | tone 决定选中态用哪族颜色，与 variant 正交；这里固定 card 形态只看语气的差别 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; inline-size: 100%">
    <XhTabsRoot
      v-for="t in tones"
      :key="t"
      variant="card"
      :tone="t"
      default-value="selected"
      style="inline-size: 100%"
    >
      <XhTabsList>
        <XhTabsTrigger value="selected">{{ t }}（选中）</XhTabsTrigger>
        <XhTabsTrigger value="other">未选</XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent value="selected">选中面板</XhTabsContent>
      <XhTabsContent value="other">另一个面板</XhTabsContent>
    </XhTabsRoot>
  </div>
</template>
