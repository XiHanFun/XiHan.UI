<!-- 形态 | outline、subtle 和 ghost -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhSelectRoot
      v-for="v in variants"
      :key="v"
      :variant="v"
      :collection="fruits"
      :default-value="['apple']"
      :label="v"
      placeholder="请选择"
    />
  </div>
</template>
