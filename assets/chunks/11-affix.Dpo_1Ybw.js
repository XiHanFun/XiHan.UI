const e=`<!-- 框内单位与货币符号 | 前后缀图标/文字直接流式插进 control：减在左、加在右、输入框居中，前后缀排在输入框两侧 -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhNumberFieldRoot default-value="99" :min="0" :max="9999">
    <XhNumberFieldLabel>单价</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <span style="color: var(--xh-fg-muted)">¥</span>
      <XhNumberFieldInput />
      <span style="color: var(--xh-fg-muted)">元</span>
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="500" :min="0" :max="5000" :step="50">
    <XhNumberFieldLabel>重量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <XhNumberFieldInput />
      <span style="color: var(--xh-fg-muted)">g</span>
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
</template>
`;export{e as default};
