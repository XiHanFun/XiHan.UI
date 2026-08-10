<!-- 框内单位与货币符号 | 前后缀压在输入框上，输入框自己让出内边距；加减钮照旧摆在包裹层里 -->
<script setup lang="ts">
import {
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

// 不吃指针事件，点在符号上仍然落到输入框里
const prefix =
  "position: absolute; inset-block: 0; inset-inline-start: 10px; display: flex; align-items: center; color: var(--xh-fg-muted); pointer-events: none";
const suffix =
  "position: absolute; inset-block: 0; inset-inline-end: 10px; display: flex; align-items: center; color: var(--xh-fg-muted); pointer-events: none";
</script>

<template>
  <XhNumberFieldRoot default-value="99" :min="0" :max="9999">
    <XhNumberFieldLabel>单价</XhNumberFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <!-- 这层包裹只提供定位参照，边框与底色仍长在输入框自己身上 -->
      <div style="position: relative; display: inline-flex">
        <XhNumberFieldInput
          style="inline-size: 120px; padding-inline: 26px 38px; text-align: center"
        />
        <span :style="prefix">¥</span>
        <span :style="suffix">元</span>
      </div>
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </div>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="500" :min="0" :max="5000" :step="50">
    <XhNumberFieldLabel>重量</XhNumberFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <div style="position: relative; display: inline-flex">
        <XhNumberFieldInput
          style="inline-size: 110px; padding-inline-end: 32px; text-align: center"
        />
        <span :style="suffix">g</span>
      </div>
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </div>
  </XhNumberFieldRoot>
</template>
