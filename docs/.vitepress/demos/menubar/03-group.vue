<!-- 分组与标记位 | group 用 value 跟自己的 group-label 配对，item-indicator 是纯装饰的勾选位 -->
<script setup lang="ts">
import { ref } from "vue";
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

const theme = ref("light");

function onSelect(details: { menu: string; value: string }): void {
  if (details.menu === "view") theme.value = details.value;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot @select="onSelect">
      <XhMenubarTrigger value="view">视图</XhMenubarTrigger>

      <XhMenubarPositioner value="view">
        <XhMenubarContent>
          <XhMenubarGroup value="theme">
            <XhMenubarGroupLabel>主题</XhMenubarGroupLabel>
            <XhMenubarItem value="light">
              <XhMenubarItemIndicator>
                {{ theme === "light" ? "✓" : "" }}
              </XhMenubarItemIndicator>
              <XhMenubarItemText>浅色</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarItem value="dark">
              <XhMenubarItemIndicator>
                {{ theme === "dark" ? "✓" : "" }}
              </XhMenubarItemIndicator>
              <XhMenubarItemText>深色</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarGroup>

          <XhMenubarSeparator />

          <XhMenubarGroup value="panel">
            <XhMenubarGroupLabel>面板</XhMenubarGroupLabel>
            <XhMenubarItem value="sidebar">
              <XhMenubarItemText>侧栏</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarItem value="terminal">
              <XhMenubarItemText>终端</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarGroup>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>

    <span>当前主题：{{ theme === "light" ? "浅色" : "深色" }}</span>
  </div>
</template>
