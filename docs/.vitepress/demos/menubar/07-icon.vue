<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 图标与快捷键 | 补充常用命令的识别信息 -->
<script setup lang="ts">
import { FileIcon, FolderIcon, PencilIcon, PlusIcon, SaveIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenubarRoot style="background: var(--xh-bg-subtle)">
    <XhMenubarTrigger value="file"><XhIcon :icon="FileIcon" size="sm" />文件</XhMenubarTrigger>
    <XhMenubarTrigger value="edit"><XhIcon :icon="PencilIcon" size="sm" />编辑</XhMenubarTrigger>
    <XhMenubarPositioner value="file">
      <XhMenubarContent>
        <XhMenubarItem value="new"><XhIcon :icon="PlusIcon" size="sm" /><XhMenubarItemText>新建</XhMenubarItemText><span aria-hidden="true">⌘ N</span></XhMenubarItem>
        <XhMenubarItem value="open"><XhIcon :icon="FolderIcon" size="sm" /><XhMenubarItemText>打开</XhMenubarItemText><span aria-hidden="true">⌘ O</span></XhMenubarItem>
        <XhMenubarSeparator />
        <XhMenubarItem value="save"><XhIcon :icon="SaveIcon" size="sm" /><XhMenubarItemText>保存</XhMenubarItemText><span aria-hidden="true">⌘ S</span></XhMenubarItem>
      </XhMenubarContent>
    </XhMenubarPositioner>
    <XhMenubarPositioner value="edit">
      <XhMenubarContent>
        <XhMenubarItem value="undo">撤销</XhMenubarItem>
        <XhMenubarItem value="redo">重做</XhMenubarItem>
      </XhMenubarContent>
    </XhMenubarPositioner>
  </XhMenubarRoot>
</template>
