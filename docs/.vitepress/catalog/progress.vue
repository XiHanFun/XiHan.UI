<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); inline-size: var(--xh-doc-catalog-w)">
    <XhProgress :value="30" />
    <XhProgress :value="72" tone="success" />
  </div>
</template>
