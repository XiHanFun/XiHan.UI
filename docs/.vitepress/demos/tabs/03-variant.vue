<!-- 分段变体 | 使用浅色标签带与浮起的选中面 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="overview" variant="segment" style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="数据视图">
      <XhTabsTrigger value="overview">概览</XhTabsTrigger>
      <XhTabsTrigger value="analytics">分析</XhTabsTrigger>
      <XhTabsTrigger value="reports">报告</XhTabsTrigger>
    </XhTabsList>
    <XhTabsContent value="overview">查看项目概览。</XhTabsContent>
    <XhTabsContent value="analytics">查看项目分析。</XhTabsContent>
    <XhTabsContent value="reports">查看项目报告。</XhTabsContent>
  </XhTabsRoot>
</template>
