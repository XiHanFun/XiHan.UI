<!-- 子菜单 | 将相关命令收进下一层 -->
<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuSub,
  XhContextMenuSubTrigger,
  XhContextMenuTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
} from "@xihan-ui/vue";
</script>

<template>
  <XhContextMenuRoot>
    <XhContextMenuTrigger
      style="display: grid; place-items: center; inline-size: min(480px, 100%); min-block-size: 144px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu"
    >
      右键管理项目
    </XhContextMenuTrigger>
    <XhContextMenuPositioner>
      <XhContextMenuContent>
        <XhContextMenuItem value="open">打开</XhContextMenuItem>
        <XhContextMenuItem value="rename">重命名</XhContextMenuItem>
        <XhContextMenuSeparator />
        <XhContextMenuSub value="share">
          <XhContextMenuSubTrigger>发送到</XhContextMenuSubTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem value="email">邮件</XhMenuItem>
              <XhMenuItem value="message">消息</XhMenuItem>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhContextMenuSub>
        <XhContextMenuSeparator />
        <XhContextMenuItem value="delete">移到回收站</XhContextMenuItem>
      </XhContextMenuContent>
    </XhContextMenuPositioner>
  </XhContextMenuRoot>
</template>
