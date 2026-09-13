const o=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 分组 | 将相关操作收在一起 -->
<script setup lang="ts">
import {
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhToolbarRoot aria-label="编辑操作">
    <XhToolbarGroup>
      <XhToolbarItem value="copy" type="button">复制</XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="cut" type="button">剪切</XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="paste" type="button">粘贴</XhToolbarItem>
    </XhToolbarGroup>
    <XhToolbarSeparator />
    <XhToolbarGroup>
      <XhToolbarItem value="undo" type="button">撤销</XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="redo" type="button">重做</XhToolbarItem>
    </XhToolbarGroup>
  </XhToolbarRoot>
</template>
`;export{o as default};
