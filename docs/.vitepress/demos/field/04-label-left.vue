<!-- 标签左置 | 各部件都是独立节点，把根节点改成两列网格就能把标题挪到控件左边，说明与错误文案跟着对齐到控件那一列 -->
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
      <input value="abc" />
    </XhFieldControl>
    <XhFieldDescription style="grid-column-start: 2;">留空表示使用默认端口</XhFieldDescription>
    <XhFieldErrorText style="grid-column-start: 2;">端口只能是数字</XhFieldErrorText>
  </XhFieldRoot>
</template>
