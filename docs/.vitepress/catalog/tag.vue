<script setup lang="ts">
import { XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const topics = [
  { label: "前端", tone: "brand" },
  { label: "无头内核", tone: "neutral" },
  { label: "可访问性", tone: "success" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px">
    <XhTagRoot v-for="topic in topics" :key="topic.label" :tone="topic.tone">
      <XhTagLabel>{{ topic.label }}</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
