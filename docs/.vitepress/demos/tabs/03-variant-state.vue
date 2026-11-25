<!-- 形态与状态 | 分段形态使用浅色标签带与浮起的选中面；禁用的标签留在原位，保留暂不可用的内容入口 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-6)">
    <XhTabsRoot default-value="overview" variant="segmented" style="inline-size: 360px; max-inline-size: 100%">
      <XhTabsList aria-label="数据视图">
        <XhTabsTrigger value="overview">概览</XhTabsTrigger>
        <XhTabsTrigger value="analytics">分析</XhTabsTrigger>
        <XhTabsTrigger value="reports">报告</XhTabsTrigger>
        <XhTabsIndicator />
      </XhTabsList>
      <XhTabsContent value="overview">查看项目概览。</XhTabsContent>
      <XhTabsContent value="analytics">查看项目分析。</XhTabsContent>
      <XhTabsContent value="reports">查看项目报告。</XhTabsContent>
    </XhTabsRoot>

    <XhTabsRoot default-value="active" style="inline-size: 360px; max-inline-size: 100%">
      <XhTabsList aria-label="标签状态">
        <XhTabsTrigger value="active">当前</XhTabsTrigger>
        <XhTabsTrigger value="disabled" disabled>不可用</XhTabsTrigger>
        <XhTabsTrigger value="available">可用</XhTabsTrigger>
        <XhTabsIndicator />
      </XhTabsList>
      <XhTabsContent value="active">当前标签可以正常切换。</XhTabsContent>
      <XhTabsContent value="disabled">此内容暂不可用。</XhTabsContent>
      <XhTabsContent value="available">此标签可以选择。</XhTabsContent>
    </XhTabsRoot>
  </div>
</template>
