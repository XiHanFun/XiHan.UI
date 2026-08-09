<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 solid 形态只看语气的差别 -->
<script setup lang="ts">
import { XhBadge } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <XhBadge v-for="t in tones" :key="t" variant="solid" :tone="t">{{ t }}</XhBadge>
</template>
