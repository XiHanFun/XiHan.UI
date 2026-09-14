<script setup lang="ts">
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "standard", label: "标准版" },
  { value: "pro", label: "专业版" },
];
</script>

<template>
  <XhRadioGroupRoot :collection="plans" default-value="standard" label="套餐" />
</template>
