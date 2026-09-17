<script setup lang="ts">
import { XhTimestamp } from "@xihan-ui/vue";

const at = new Date(2026, 7, 11, 9, 30, 5);
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-1_5)">
    <XhTimestamp :value="at" />
    <XhTimestamp :value="at" type="date" />
    <XhTimestamp :value="at" type="relative" :now="new Date(2026, 7, 11, 11, 0, 0)" />
  </div>
</template>
