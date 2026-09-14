<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 220px">
    <XhProgress :value="30" />
    <XhProgress :value="72" tone="success" />
  </div>
</template>
