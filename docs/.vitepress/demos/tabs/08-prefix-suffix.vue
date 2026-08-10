<!-- 标签栏前后缀 | list 里只收 trigger；要在标签栏两侧摆东西，把它们与 list 排进同一行 -->
<script setup lang="ts">
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="all" variant="segment" style="inline-size: 100%">
    <!-- 前后缀是这一行的兄弟节点，不进 list：list 里只放标签 -->
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-size: 12px">收件箱</span>
      <XhTabsList>
        <XhTabsTrigger value="all">全部</XhTabsTrigger>
        <XhTabsTrigger value="unread">未读</XhTabsTrigger>
        <XhTabsTrigger value="flagged">已标记</XhTabsTrigger>
      </XhTabsList>
      <XhButton size="sm" variant="outline" style="margin-inline-start: auto">
        写邮件
      </XhButton>
    </div>

    <XhTabsContent value="all">全部邮件。</XhTabsContent>
    <XhTabsContent value="unread">未读邮件。</XhTabsContent>
    <XhTabsContent value="flagged">已标记邮件。</XhTabsContent>
  </XhTabsRoot>
</template>
