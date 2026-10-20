<!-- 图标与快捷键 | 为常用命令补充识别信息 -->
<script setup lang="ts">
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhMenuContent,
  XhMenuItem,
  XhMenuItemIcon,
  XhMenuItemShortcut,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenuRoot>
    <XhMenuTrigger as-child>
      <XhButton variant="subtle">编辑</XhButton>
    </XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="copy">
          <XhMenuItemIcon><XhIcon :icon="CopyIcon" size="sm" /></XhMenuItemIcon>
          <XhMenuItemText>复制</XhMenuItemText>
          <XhMenuItemShortcut>⌘ C</XhMenuItemShortcut>
        </XhMenuItem>
        <XhMenuItem value="rename">
          <XhMenuItemIcon><XhIcon :icon="PencilIcon" size="sm" /></XhMenuItemIcon>
          <XhMenuItemText>重命名</XhMenuItemText>
          <XhMenuItemShortcut>F2</XhMenuItemShortcut>
        </XhMenuItem>
        <XhMenuSeparator />
        <XhMenuItem value="delete">
          <XhMenuItemIcon><XhIcon :icon="TrashIcon" size="sm" /></XhMenuItemIcon>
          <XhMenuItemText>移到回收站</XhMenuItemText>
          <XhMenuItemShortcut>⌫</XhMenuItemShortcut>
        </XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
