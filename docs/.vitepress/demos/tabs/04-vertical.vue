<!-- 竖排 | orientation 换掉方向键收哪一对键：竖排认上下键，左右键原样放行给页面 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot
    default-value="general"
    orientation="vertical"
    style="inline-size: 100%"
  >
    <XhTabsList>
      <XhTabsTrigger value="general">通用</XhTabsTrigger>
      <XhTabsTrigger value="appearance">外观</XhTabsTrigger>
      <XhTabsTrigger value="advanced">高级</XhTabsTrigger>
    </XhTabsList>

    <XhTabsContent value="general">通用设置面板</XhTabsContent>
    <XhTabsContent value="appearance">外观设置面板</XhTabsContent>
    <XhTabsContent value="advanced">高级设置面板</XhTabsContent>
  </XhTabsRoot>
</template>
