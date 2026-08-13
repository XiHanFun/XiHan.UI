<!-- 环形 | variant="circle" 把同一份进度画成环，尺寸档改的是直径 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
    <XhProgress variant="circle" :value="30" size="sm" />
    <XhProgress variant="circle" :value="72" />
    <XhProgress variant="circle" :value="100" size="lg" tone="success" />
  </div>
</template>
