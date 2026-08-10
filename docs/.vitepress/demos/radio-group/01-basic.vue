<!-- 基础用法 | collection 是条目的事实源，交一组数据即铺开整组；组内只有一个 Tab 停靠点，进组后四个方向键都能切换 -->
<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "standard", label: "标准版" },
  { value: "pro", label: "专业版" },
];
</script>

<template>
  <XhRadioGroupRoot
    :collection="plans"
    default-value="standard"
    label="套餐"
    name="plan"
  />
</template>
