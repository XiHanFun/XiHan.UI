<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 tabs 相关实现。 -->

<script setup lang="ts">
import { XhTabsContent, XhTabsList, XhTabsRoot, XhTabsTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="overview" style="inline-size: 220px">
    <XhTabsList aria-label="内容视图">
      <XhTabsTrigger value="overview">概览</XhTabsTrigger>
      <XhTabsTrigger value="activity">动态</XhTabsTrigger>
    </XhTabsList>
    <XhTabsContent value="overview">项目概览</XhTabsContent>
    <XhTabsContent value="activity">近期动态</XhTabsContent>
  </XhTabsRoot>
</template>
