<!-- 区间与步长 | 方向键按 step，PageUp 与 PageDown 按 largeStep，Home 与 End 取端点；到达边界时对应按钮转灰 -->
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
  <XhNumberFieldRoot
    v-slot="{ valueAsNumber, canIncrement, canDecrement }"
    default-value="10"
    :min="0"
    :max="20"
    :step="2"
    :large-step="10"
  >
    <XhNumberFieldLabel>数量（0 – 20，每档 2）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
    <span>
      数值：{{ Number.isNaN(valueAsNumber) ? "（空）" : valueAsNumber }} ·
      可加：{{ canIncrement ? "是" : "否" }} · 可减：{{ canDecrement ? "是" : "否" }}
    </span>
  </XhNumberFieldRoot>
</template>
