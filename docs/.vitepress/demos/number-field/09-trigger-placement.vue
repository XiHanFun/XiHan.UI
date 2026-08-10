<!-- 加减钮排布 | 两个触发器摆在哪儿由作者写模板决定，钮里放什么字符也一样；行为不随位置变 -->
<script setup lang="ts">
import {
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot default-value="1" :min="0" :max="9">
    <XhNumberFieldLabel>分列两端</XhNumberFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <XhNumberFieldInput style="inline-size: 80px; text-align: center" />
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </div>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="1" :min="0" :max="9">
    <XhNumberFieldLabel>并到右侧</XhNumberFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhNumberFieldInput style="inline-size: 80px; text-align: center" />
      <XhNumberFieldDecrementTrigger>▾</XhNumberFieldDecrementTrigger>
      <XhNumberFieldIncrementTrigger>▴</XhNumberFieldIncrementTrigger>
    </div>
  </XhNumberFieldRoot>
</template>
