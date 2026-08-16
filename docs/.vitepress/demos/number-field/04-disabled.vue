<!-- 禁用与只读 | 两者都改不动值，禁用还会把加减按钮一并关掉、值也不再随表单提交 -->
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
  <XhNumberFieldRoot default-value="5" disabled>
    <XhNumberFieldLabel>禁用</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput style="inline-size: 80px; text-align: center" />
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="5" read-only>
    <XhNumberFieldLabel>只读</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput style="inline-size: 80px; text-align: center" />
      <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
      <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
</template>
