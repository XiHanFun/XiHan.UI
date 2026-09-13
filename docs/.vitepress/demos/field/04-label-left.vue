<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 标签左置 | 将标签放在控件左侧 -->
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 第一列放标题，第二列放控件、说明与错误文案 -->
  <XhFieldRoot
    invalid
    style="display: grid; grid-template-columns: 72px 1fr; align-items: center; column-gap: 12px; row-gap: 4px; inline-size: 360px;"
  >
    <XhFieldLabel>端口</XhFieldLabel>
    <XhFieldControl>
      <input value="abc">
    </XhFieldControl>
    <XhFieldDescription style="grid-column-start: 2;">留空表示使用默认端口</XhFieldDescription>
    <XhFieldErrorText style="grid-column-start: 2;">端口只能是数字</XhFieldErrorText>
  </XhFieldRoot>
</template>
