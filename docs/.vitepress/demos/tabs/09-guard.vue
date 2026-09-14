<!-- 禁用标签 | 保留暂不可用的内容入口 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="active" style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="标签状态">
      <XhTabsTrigger value="active">当前</XhTabsTrigger>
      <XhTabsTrigger value="disabled" disabled>不可用</XhTabsTrigger>
      <XhTabsTrigger value="available">可用</XhTabsTrigger>
    </XhTabsList>

    <XhTabsContent value="active">当前标签可以正常切换。</XhTabsContent>
    <XhTabsContent value="disabled">此内容暂不可用。</XhTabsContent>
    <XhTabsContent value="available">此标签可以选择。</XhTabsContent>
  </XhTabsRoot>
</template>
