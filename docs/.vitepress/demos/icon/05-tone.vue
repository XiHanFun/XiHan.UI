<!-- 颜色 | 使用语义颜色 -->
<script setup lang="ts">
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";

const tones = ["brand", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <XhIcon v-for="tone in tones" :key="tone" :icon="StarIcon" :tone="tone" size="lg" />
</template>
