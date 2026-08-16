<!-- 尺寸 | 输入框高度与加减按钮一起换档，不传 size 即默认档 -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhNumberFieldRoot v-for="s in sizes" :key="s.label" :size="s.size" default-value="1">
      <XhNumberFieldLabel>{{ s.label }}</XhNumberFieldLabel>
      <XhNumberFieldControl>
        <XhNumberFieldInput style="inline-size: 72px; text-align: center" />
        <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
        <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
      </XhNumberFieldControl>
    </XhNumberFieldRoot>
  </div>
</template>
