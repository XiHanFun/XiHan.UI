<!-- 变体 | 设置整组外观 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
const variants = ["solid", "subtle", "outline", "ghost"] as const;
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToggleGroupRoot
      v-for="variant in variants"
      :key="variant"
      :collection="options"
      default-value="week"
      :variant="variant"
    />
  </div>
</template>
