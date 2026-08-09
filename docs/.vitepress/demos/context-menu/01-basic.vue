<!-- 基础用法 | 在触发区上右键（触摸端长按），菜单钉在按下去的那一点上而不是贴着区域某条边 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from "@xihan-ui/vue";

const picked = ref("");

function onSelect(details: { value: string }): void {
  picked.value = details.value;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhContextMenuRoot @select="onSelect">
      <!-- 触发区的尺寸与排布归作者，皮肤只管它的交互观感 -->
      <XhContextMenuTrigger
        style="display: grid; place-items: center; min-block-size: 120px"
      >
        <span>在这块区域上右键</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="copy">
            <XhContextMenuItemText>复制</XhContextMenuItemText>
          </XhContextMenuItem>
          <XhContextMenuItem value="paste" disabled>
            <XhContextMenuItemText>粘贴</XhContextMenuItemText>
          </XhContextMenuItem>
          <XhContextMenuItem value="rename">
            <XhContextMenuItemText>重命名</XhContextMenuItemText>
          </XhContextMenuItem>
          <XhContextMenuSeparator />
          <XhContextMenuItem value="delete">
            <XhContextMenuItemText>删除</XhContextMenuItemText>
          </XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>

    <span>最近选中：{{ picked || "（无）" }}</span>
  </div>
</template>
