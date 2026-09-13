const n=`<!-- 图标与快捷键 | 在命令两侧补充识别信息 -->
<script setup lang="ts">
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhContextMenuContent,
  XhContextMenuItem,
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
          <XhIcon :icon="CopyIcon" size="sm" />
          <XhContextMenuItemText>复制</XhContextMenuItemText>
          <span aria-hidden="true">⌘ C</span>
        </XhContextMenuItem>
        <XhContextMenuItem value="rename">
          <XhIcon :icon="PencilIcon" size="sm" />
          <XhContextMenuItemText>重命名</XhContextMenuItemText>
          <span aria-hidden="true">F2</span>
        </XhContextMenuItem>
        <XhContextMenuSeparator />
        <XhContextMenuItem value="delete">
          <XhIcon :icon="TrashIcon" size="sm" />
          <XhContextMenuItemText>移到回收站</XhContextMenuItemText>
          <span aria-hidden="true">⌫</span>
        </XhContextMenuItem>
      </XhContextMenuContent>
    </XhContextMenuPositioner>
  </XhContextMenuRoot>
</template>
`;export{n as default};
