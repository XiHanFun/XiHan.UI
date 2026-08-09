<!-- 基础用法 | 一排 trigger 共用一个 Tab 位，positioner 与 content 靠 value 跟自己那个 trigger 配对 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/vue";

const picked = ref("");

function onSelect(details: { menu: string; value: string }): void {
  picked.value = `${details.menu} / ${details.value}`;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot @select="onSelect">
      <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
      <XhMenubarTrigger value="edit">编辑</XhMenubarTrigger>
      <XhMenubarTrigger value="view">视图</XhMenubarTrigger>

      <XhMenubarPositioner value="file">
        <XhMenubarContent>
          <XhMenubarItem value="new">
            <XhMenubarItemText>新建</XhMenubarItemText>
          </XhMenubarItem>
          <XhMenubarItem value="open">
            <XhMenubarItemText>打开</XhMenubarItemText>
          </XhMenubarItem>
          <XhMenubarSeparator />
          <XhMenubarItem value="close" disabled>
            <XhMenubarItemText>关闭</XhMenubarItemText>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>

      <XhMenubarPositioner value="edit">
        <XhMenubarContent>
          <XhMenubarItem value="undo">
            <XhMenubarItemText>撤销</XhMenubarItemText>
          </XhMenubarItem>
          <XhMenubarItem value="redo">
            <XhMenubarItemText>重做</XhMenubarItemText>
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

    <span>最近选中：{{ picked || "（无）" }}</span>
  </div>
</template>
