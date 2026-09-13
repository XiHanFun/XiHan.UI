<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 次级变体 | 使用下划线表示当前标签 -->
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
  <XhTabsRoot default-value="overview" variant="line" style="inline-size: 360px; max-inline-size: 100%">
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
</template>
