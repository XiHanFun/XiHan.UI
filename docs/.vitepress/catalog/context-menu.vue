<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 受控常开：预览只看得见、点不着，浮层就地铺在触发区旁 -->
  <XhContextMenuRoot :open="true">
    <div style="display: flex; align-items: center; gap: 10px">
      <XhContextMenuTrigger style="display: grid; place-items: center; inline-size: 72px; block-size: 88px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-size: 12px">
        规范.pdf
      </XhContextMenuTrigger>
      <XhContextMenuContent style="position: static; inline-size: 132px">
        <XhContextMenuItem value="open">打开</XhContextMenuItem>
        <XhContextMenuItem value="rename">重命名</XhContextMenuItem>
        <XhContextMenuSeparator />
        <XhContextMenuItem value="delete">移到回收站</XhContextMenuItem>
      </XhContextMenuContent>
    </div>
  </XhContextMenuRoot>
</template>
