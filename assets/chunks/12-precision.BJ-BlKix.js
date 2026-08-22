const e=`<!-- 固定小数位 | 步进本身带定点规整，宿主在离开输入框与松开加减钮时把值补齐到两位小数 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

const price = ref("12.50");

// 补齐两位小数；空值与非法值一律留空
function pad() {
  const n = Number(price.value);
  price.value = price.value === "" || !Number.isFinite(n) ? "" : n.toFixed(2);
}
<\/script>

<template>
  <XhNumberFieldRoot v-model:value="price" :min="0" :max="999" :step="0.1">
    <XhNumberFieldLabel>单价（每档 0.1）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput @blur="pad" />
      <XhNumberFieldDecrementTrigger @pointerup="pad" />
      <XhNumberFieldIncrementTrigger @pointerup="pad" />
    </XhNumberFieldControl>
    <span>当前：{{ price || "（空）" }}</span>
  </XhNumberFieldRoot>
</template>
`;export{e as default};
