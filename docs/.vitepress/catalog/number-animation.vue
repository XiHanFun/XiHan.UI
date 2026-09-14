<script setup lang="ts">
import { XhNumberAnimation } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 4px; justify-items: center">
    <XhNumberAnimation :from="0" :to="12480" size="lg" tone="brand" />
    <span style="color: var(--xh-fg-muted); font-size: 12px">本月新增</span>
  </div>
</template>
