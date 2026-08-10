<!-- 框内前后缀 | 前后缀压在输入框上，输入框自己让出内边距，两者共用同一份边框与底色 -->
<script setup lang="ts">
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";

// 不吃指针事件，点在前后缀上仍然落到输入框里
const prefix =
  "position: absolute; inset-block: 0; inset-inline-start: 12px; display: flex; align-items: center; color: var(--xh-fg-muted); pointer-events: none";
const suffix =
  "position: absolute; inset-block: 0; inset-inline-end: 12px; display: flex; align-items: center; color: var(--xh-fg-muted); pointer-events: none";
</script>

<template>
  <XhTextFieldRoot placeholder="0.00">
    <XhTextFieldLabel>金额</XhTextFieldLabel>
    <!-- 这层包裹只提供定位参照，边框与底色仍长在输入框自己身上 -->
    <div style="position: relative; display: inline-flex">
      <XhTextFieldInput
        style="inline-size: 200px; padding-inline: 30px 44px"
        inputmode="decimal"
      />
      <span :style="prefix">¥</span>
      <span :style="suffix">元</span>
    </div>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="170">
    <XhTextFieldLabel>身高</XhTextFieldLabel>
    <div style="position: relative; display: inline-flex">
      <XhTextFieldInput
        style="inline-size: 160px; padding-inline-end: 40px"
        inputmode="numeric"
      />
      <span :style="suffix">cm</span>
    </div>
  </XhTextFieldRoot>
</template>
