<!-- 形态 | variant 只改选中态怎么画，切换行为与键盘操作三档一致；不写 variant 即 line 档 -->
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

// 第一档不写 variant，用 undefined 表达 line 缺省
const variants = [
  { variant: undefined, label: "line（缺省）" },
  { variant: "card", label: "card" },
  { variant: "segment", label: "segment" },
] as const;

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  { value: "api", label: "API" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div v-for="v in variants" :key="v.label">
      <div style="margin-block-end: 8px; font-size: 12px">{{ v.label }}</div>
      <XhTabsRoot
        :variant="v.variant"
        :collection="tabs"
        default-value="overview"
        style="inline-size: 100%"
      >
        <template #panel="node">{{ node.label }}面板</template>
      </XhTabsRoot>
    </div>
  </div>
</template>
