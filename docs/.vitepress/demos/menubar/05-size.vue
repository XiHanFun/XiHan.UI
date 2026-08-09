<!-- 尺寸 | size 一档换掉 trigger 与菜单条目的字号与内边距，写在 root 上、浮层里的条目一并跟着变 -->
<script setup lang="ts">
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
];
</script>

<template>
  <!-- 菜单浮层往下落位，给容器底部留出它展开的空间 -->
  <div style="inline-size: 100%; display: grid; gap: 12px; padding-block-end: 180px">
    <div
      v-for="s in sizes"
      :key="s.label"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 60px; flex: none">{{ s.label }}</span>
      <XhMenubarRoot :size="s.value">
        <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
        <XhMenubarTrigger value="view">视图</XhMenubarTrigger>

        <XhMenubarPositioner value="file">
          <XhMenubarContent>
            <XhMenubarItem value="new">
              <XhMenubarItemText>新建</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarItem value="open">
              <XhMenubarItemText>打开</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarContent>
        </XhMenubarPositioner>

        <XhMenubarPositioner value="view">
          <XhMenubarContent>
            <XhMenubarItem value="zoom-in">
              <XhMenubarItemText>放大</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarItem value="zoom-out">
              <XhMenubarItemText>缩小</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarContent>
        </XhMenubarPositioner>
      </XhMenubarRoot>
    </div>
  </div>
</template>
