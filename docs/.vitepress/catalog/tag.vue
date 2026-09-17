<script setup lang="ts">
import { XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const topics = ["前端", "无头内核", "可访问性"];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--xh-space-2)">
    <XhTagRoot v-for="topic in topics" :key="topic">
      <XhTagLabel>{{ topic }}</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
