<script setup lang="ts">
import { XhTabsContent, XhTabsIndicator, XhTabsList, XhTabsRoot, XhTabsTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="overview" style="inline-size: var(--xh-doc-catalog-w)">
    <XhTabsList aria-label="内容视图">
      <XhTabsTrigger value="overview">概览</XhTabsTrigger>
      <XhTabsTrigger value="activity">动态</XhTabsTrigger>
      <XhTabsIndicator />
    </XhTabsList>
    <XhTabsContent value="overview">项目概览</XhTabsContent>
    <XhTabsContent value="activity">近期动态</XhTabsContent>
  </XhTabsRoot>
</template>
