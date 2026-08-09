<!-- 尺寸 | size 换标签的高度、内边距与字号，不传 size 即默认档 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div v-for="s in sizes" :key="s.label">
      <div style="margin-block-end: 8px; font-size: 12px">{{ s.label }}</div>
      <XhTabsRoot :size="s.size" default-value="overview" style="inline-size: 100%">
        <XhTabsList>
          <XhTabsTrigger value="overview">概览</XhTabsTrigger>
          <XhTabsTrigger value="usage">用法</XhTabsTrigger>
          <XhTabsTrigger value="api">API</XhTabsTrigger>
        </XhTabsList>

        <XhTabsContent value="overview">概览面板</XhTabsContent>
        <XhTabsContent value="usage">用法面板</XhTabsContent>
        <XhTabsContent value="api">API 面板</XhTabsContent>
      </XhTabsRoot>
    </div>
  </div>
</template>
