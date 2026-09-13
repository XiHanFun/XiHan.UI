const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 在目标区域右键打开命令菜单 -->
<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";

const commands = [
  { value: "open", label: "打开" },
  { value: "rename", label: "重命名" },
  { value: "duplicate", label: "创建副本" },
  { value: "delete", label: "移到回收站", separatorBefore: true },
];
<\/script>

<template>
  <XhContextMenuRoot :collection="commands">
    <template #trigger>
      <span
        style="
          display: grid;
          place-items: center;
          gap: 6px;
          inline-size: min(480px, 100%);
          min-block-size: 160px;
          border-radius: var(--xh-shape-surface);
          background: var(--xh-bg-subtle);
          cursor: context-menu;
        "
      >
        <strong>设计规范.pdf</strong>
        <span style="color: var(--xh-fg-muted)">右键打开菜单</span>
      </span>
    </template>
  </XhContextMenuRoot>
</template>
`;export{n as default};
