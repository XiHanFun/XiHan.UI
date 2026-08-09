<!-- 尺寸 | size 只改高度、内边距与字号，不写就是缺省档 -->
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <XhToggle variant="outline" size="sm">小</XhToggle>
    <XhToggle variant="outline">缺省</XhToggle>
    <XhToggle variant="outline" size="lg">大</XhToggle>
  </div>
</template>
