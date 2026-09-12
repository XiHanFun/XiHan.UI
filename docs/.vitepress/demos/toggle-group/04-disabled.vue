<!-- 禁用 | 禁用单个选项 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中", disabled: true },
  { value: "right", label: "右对齐" },
];
</script>

<template>
  <XhToggleGroupRoot :collection="aligns" default-value="center" />
</template>
