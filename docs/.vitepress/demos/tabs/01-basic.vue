<!-- 基础用法 | 不传 value 即为非受控，default-value 指定初始选中项；面板常挂，靠 hidden 显隐 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="overview" style="inline-size: 100%">
    <XhTabsList>
      <XhTabsTrigger value="overview">概览</XhTabsTrigger>
      <XhTabsTrigger value="usage">用法</XhTabsTrigger>
      <XhTabsTrigger value="api" disabled>API（禁用）</XhTabsTrigger>
    </XhTabsList>

    <XhTabsContent value="overview">
      概览面板：默认 automatic，方向键移动焦点时顺带切换选中。
    </XhTabsContent>
    <XhTabsContent value="usage">
      用法面板：面板不做懒挂载，切走再切回来，里面的滚动位置与表单态都还在。
    </XhTabsContent>
    <XhTabsContent value="api">API 面板。</XhTabsContent>
  </XhTabsRoot>
</template>
