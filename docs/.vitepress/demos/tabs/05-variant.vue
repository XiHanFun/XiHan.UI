<!-- 变体 | 区分主要、次级与卡片式导航 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const variants = [
  { value: undefined, label: "主要" },
  { value: "line", label: "次级" },
  { value: "card", label: "卡片" },
];
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: min(560px, 100%)">
    <div v-for="variant in variants" :key="variant.label" style="display: grid; gap: 6px">
      <span style="color: var(--xh-fg-muted)">{{ variant.label }}</span>
      <XhTabsRoot default-value="overview" :variant="variant.value">
        <XhTabsList :aria-label="`${variant.label}标签页`">
          <XhTabsTrigger value="overview">概览</XhTabsTrigger>
          <XhTabsTrigger value="analytics">分析</XhTabsTrigger>
          <XhTabsTrigger value="reports">报告</XhTabsTrigger>
          <XhTabsIndicator />
        </XhTabsList>
        <XhTabsContent value="overview">查看项目概览。</XhTabsContent>
        <XhTabsContent value="analytics">查看项目分析。</XhTabsContent>
        <XhTabsContent value="reports">查看项目报告。</XhTabsContent>
      </XhTabsRoot>
    </div>
  </div>
</template>
