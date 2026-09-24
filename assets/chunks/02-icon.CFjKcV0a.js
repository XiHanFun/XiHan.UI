const n=`<!-- 图标与快捷键 | 为常用命令补充识别信息 -->
<script setup lang="ts">
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhMenuContent,
  XhMenuItem,
  XhMenuItemIndicator,
  XhMenuItemShortcut,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhMenuRoot>
    <XhMenuTrigger as-child>
      <XhButton variant="subtle">编辑</XhButton>
    </XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="copy">
          <XhMenuItemIndicator><XhIcon :icon="CopyIcon" size="sm" /></XhMenuItemIndicator>
          <XhMenuItemText>复制</XhMenuItemText>
          <XhMenuItemShortcut>⌘ C</XhMenuItemShortcut>
        </XhMenuItem>
        <XhMenuItem value="rename">
          <XhMenuItemIndicator><XhIcon :icon="PencilIcon" size="sm" /></XhMenuItemIndicator>
          <XhMenuItemText>重命名</XhMenuItemText>
          <XhMenuItemShortcut>F2</XhMenuItemShortcut>
        </XhMenuItem>
        <XhMenuSeparator />
        <XhMenuItem value="delete">
          <XhMenuItemIndicator><XhIcon :icon="TrashIcon" size="sm" /></XhMenuItemIndicator>
          <XhMenuItemText>移到回收站</XhMenuItemText>
          <XhMenuItemShortcut>⌫</XhMenuItemShortcut>
        </XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
`;export{n as default};
