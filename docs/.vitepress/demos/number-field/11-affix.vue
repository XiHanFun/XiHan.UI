<!-- 框内单位与货币符号 | 前后缀压在输入框上：control 本身就是定位参照，符号绝对定位进框，输入框让出内边距 -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

// 不吃指针事件，点在符号上仍然落到输入框里。
// 后缀要避开右侧叠进去的加减钮：按钮宽取公开覆盖槽 --xh-number-field-trigger-size 的默认值 36px
const prefix =
  "position: absolute; inset-block: 0; inset-inline-start: 10px; display: flex; align-items: center; color: var(--xh-fg-muted); pointer-events: none";
const suffix =
  "position: absolute; inset-block: 0; inset-inline-end: calc(var(--xh-number-field-trigger-size, 36px) + 10px); display: flex; align-items: center; color: var(--xh-fg-muted); pointer-events: none";
</script>

<template>
  <XhNumberFieldRoot default-value="99" :min="0" :max="9999">
    <XhNumberFieldLabel>单价</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput
        style="inline-size: 160px; padding-inline: 26px calc(var(--xh-number-field-trigger-size, 36px) + 36px); text-align: center"
      />
      <span :style="prefix">¥</span>
      <span :style="suffix">元</span>
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="500" :min="0" :max="5000" :step="50">
    <XhNumberFieldLabel>重量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput
        style="inline-size: 140px; padding-inline-end: calc(var(--xh-number-field-trigger-size, 36px) + 26px); text-align: center"
      />
      <span :style="suffix">g</span>
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
</template>
