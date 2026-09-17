<script setup lang="ts">
import { XhNumberAnimation } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-1); justify-items: center">
    <XhNumberAnimation :from="0" :to="12480" size="lg" />
    <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">本月新增</span>
  </div>
</template>
