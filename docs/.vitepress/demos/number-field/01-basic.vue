<!-- 基础用法 | 加减按钮与输入框共用一份状态；值是原始输入串，不传 value 即为非受控 -->
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
  <XhNumberFieldRoot default-value="1">
    <XhNumberFieldLabel>数量</XhNumberFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <XhNumberFieldInput style="inline-size: 80px; text-align: center" />
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </div>
  </XhNumberFieldRoot>
</template>
