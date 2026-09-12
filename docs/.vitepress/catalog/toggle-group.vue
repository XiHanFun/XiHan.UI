<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "left", label: "左" },
  { value: "center", label: "中" },
  { value: "right", label: "右" },
];
</script>

<template>
  <XhToggleGroupRoot :collection="options" default-value="left" />
</template>
