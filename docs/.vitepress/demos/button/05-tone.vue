<!-- 语气 | tone 决定用哪族颜色，与 variant 正交：四种形态 × 六种语气都成立 -->
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div v-for="variant in ['solid', 'subtle', 'outline', 'ghost']" :key="variant" style="display: flex; gap: 8px; align-items: center">
      <span style="min-width: 56px; font-size: 13px; opacity: 0.7">{{ variant }}</span>
      <XhButton v-for="tone in tones" :key="tone" :variant="variant" :tone="tone" size="sm">
        {{ tone }}
      </XhButton>
    </div>
  </div>
</template>
