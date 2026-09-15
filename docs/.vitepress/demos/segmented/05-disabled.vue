<!-- 禁用 | 单段禁用仍可聚焦、仍是方向键的起点，只是无法选中它；整组禁用则全部不可修改 -->
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版" },
  { value: "enterprise", label: "企业版", disabled: true },
];
</script>

<template>
  <div style="display: flex; gap: 24px; flex-wrap: wrap">
    <XhSegmentedRoot
      :collection="plans"
      default-value="free"
      aria-label="套餐"
    />
    <XhSegmentedRoot
      :collection="plans"
      disabled
      default-value="pro"
      aria-label="套餐（整组禁用）"
    />
  </div>
</template>
