<!-- 提供 color-swatch 相关实现。 -->

<script setup lang="ts">
import { XhColorSwatch } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
    <XhColorSwatch value="#e11d48" size="lg" />
    <XhColorSwatch value="#3b82f6" size="lg" />
    <XhColorSwatch value="#10b98180" size="lg" />
  </div>
</template>
