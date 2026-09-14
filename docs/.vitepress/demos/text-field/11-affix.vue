<!-- 框内前后缀 | 前后缀与输入框同在 control 这一个框里排成一行，共用它的描边与底色 -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

// 不参与分宽，也不吃指针事件：点在前后缀上仍然落到输入框里
const affix = "flex: none; color: var(--xh-fg-muted); pointer-events: none";
</script>

<template>
  <XhTextFieldRoot placeholder="0.00">
    <XhTextFieldLabel>金额</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <span :style="affix">¥</span>
      <XhTextFieldInput inputmode="decimal" />
      <span :style="affix">元</span>
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="170">
    <XhTextFieldLabel>身高</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 160px">
      <XhTextFieldInput inputmode="numeric" />
      <span :style="affix">cm</span>
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
