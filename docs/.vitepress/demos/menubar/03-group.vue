<!-- 分组 | 在菜单内组织相关命令 -->
<script setup lang="ts">
import {
  XhMenubarContent,
  XhMenubarGroup,
  XhMenubarGroupLabel,
  XhMenubarItem,
  XhMenubarItemIndicator,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenubarRoot style="background: var(--xh-bg-subtle)">
    <XhMenubarTrigger value="view">视图</XhMenubarTrigger>
    <XhMenubarPositioner value="view">
      <XhMenubarContent>
        <XhMenubarGroup value="theme">
          <XhMenubarGroupLabel>主题</XhMenubarGroupLabel>
          <XhMenubarItem value="light"><XhMenubarItemIndicator /><XhMenubarItemText>浅色</XhMenubarItemText></XhMenubarItem>
          <XhMenubarItem value="dark"><XhMenubarItemText>深色</XhMenubarItemText></XhMenubarItem>
        </XhMenubarGroup>
        <XhMenubarSeparator />
        <XhMenubarGroup value="panels">
          <XhMenubarGroupLabel>面板</XhMenubarGroupLabel>
          <XhMenubarItem value="sidebar"><XhMenubarItemText>侧栏</XhMenubarItemText></XhMenubarItem>
          <XhMenubarItem value="terminal"><XhMenubarItemText>终端</XhMenubarItemText></XhMenubarItem>
        </XhMenubarGroup>
      </XhMenubarContent>
    </XhMenubarPositioner>
  </XhMenubarRoot>
</template>
