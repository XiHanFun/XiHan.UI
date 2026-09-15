const n=`<!-- 图标与快捷键 | 为常用命令补充识别信息 -->
<script setup lang="ts">
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhMenuContent,
  XhMenuItem,
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
          <XhIcon :icon="CopyIcon" size="sm" />
          <XhMenuItemText>复制</XhMenuItemText>
          <span aria-hidden="true">⌘ C</span>
        </XhMenuItem>
        <XhMenuItem value="rename">
          <XhIcon :icon="PencilIcon" size="sm" />
          <XhMenuItemText>重命名</XhMenuItemText>
          <span aria-hidden="true">F2</span>
        </XhMenuItem>
        <XhMenuSeparator />
        <XhMenuItem value="delete">
          <XhIcon :icon="TrashIcon" size="sm" />
          <XhMenuItemText>移到回收站</XhMenuItemText>
          <span aria-hidden="true">⌫</span>
        </XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
`;export{n as default};
