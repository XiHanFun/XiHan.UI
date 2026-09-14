<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const ranges = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
</script>

<template>
  <XhSegmentedRoot :collection="ranges" default-value="week" aria-label="时间粒度" />
</template>
