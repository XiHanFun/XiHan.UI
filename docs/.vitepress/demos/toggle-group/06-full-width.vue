<!-- 宽度充满 | 选项等分可用宽度 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "list", label: "列表" },
  { value: "grid", label: "网格" },
  { value: "board", label: "看板" },
];
</script>

<template>
  <div style="inline-size: min(100%, 360px)">
    <XhToggleGroupRoot :collection="options" default-value="list" full-width />
  </div>
</template>
