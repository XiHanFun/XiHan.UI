<!-- 加减钮排布 | 触发器位置由作者写模板决定：放进 control 即叠进框内右侧（一体式），不写 control 则照旧排在输入框两侧 -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot default-value="1" :min="0" :max="9">
    <XhNumberFieldLabel>一体式（control）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput style="inline-size: 96px; text-align: center" />
      <XhNumberFieldDecrementTrigger>▾</XhNumberFieldDecrementTrigger>
      <XhNumberFieldIncrementTrigger>▴</XhNumberFieldIncrementTrigger>
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="1" :min="0" :max="9">
    <XhNumberFieldLabel>分列两端（不写 control）</XhNumberFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <XhNumberFieldInput style="inline-size: 80px; text-align: center" />
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </div>
  </XhNumberFieldRoot>
</template>
