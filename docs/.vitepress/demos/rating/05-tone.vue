<!-- 语气 | tone 决定点亮的星用哪族颜色，不写时沿用警示色 -->
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRatingRoot v-for="t in tones" :key="t" v-slot="{ items }" :tone="t" :default-value="4" read-only>
      <XhRatingLabel>{{ t }}</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
