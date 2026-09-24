const n=`<!-- 图标与快捷键 | 在命令两侧补充识别信息 -->
<script setup lang="ts">
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemIndicator,
  XhContextMenuItemShortcut,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
  XhIcon,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhContextMenuRoot>
    <XhContextMenuTrigger
      style="display: grid; place-items: center; inline-size: min(480px, 100%); min-block-size: 144px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); cursor: context-menu"
    >
      右键编辑 notes.md
    </XhContextMenuTrigger>
    <XhContextMenuPositioner>
      <XhContextMenuContent>
        <XhContextMenuItem value="copy">
          <XhContextMenuItemIndicator><XhIcon :icon="CopyIcon" size="sm" /></XhContextMenuItemIndicator>
          <XhContextMenuItemText>复制</XhContextMenuItemText>
          <XhContextMenuItemShortcut>⌘ C</XhContextMenuItemShortcut>
        </XhContextMenuItem>
        <XhContextMenuItem value="rename">
          <XhContextMenuItemIndicator><XhIcon :icon="PencilIcon" size="sm" /></XhContextMenuItemIndicator>
          <XhContextMenuItemText>重命名</XhContextMenuItemText>
          <XhContextMenuItemShortcut>F2</XhContextMenuItemShortcut>
        </XhContextMenuItem>
        <XhContextMenuSeparator />
        <XhContextMenuItem value="delete">
          <XhContextMenuItemIndicator><XhIcon :icon="TrashIcon" size="sm" /></XhContextMenuItemIndicator>
          <XhContextMenuItemText>移到回收站</XhContextMenuItemText>
          <XhContextMenuItemShortcut>⌫</XhContextMenuItemShortcut>
        </XhContextMenuItem>
      </XhContextMenuContent>
    </XhContextMenuPositioner>
  </XhContextMenuRoot>
</template>
`;export{n as default};
