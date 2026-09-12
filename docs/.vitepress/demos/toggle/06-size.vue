<!-- 尺寸 | 提供三种尺寸 -->
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <XhToggle variant="outline" size="sm">小</XhToggle>
    <XhToggle variant="outline">中</XhToggle>
    <XhToggle variant="outline" size="lg">大</XhToggle>
  </div>
</template>
