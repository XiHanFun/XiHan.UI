<!-- 语气 | tone 决定数值与前后缀用哪族颜色，标签始终保持弱前景 -->
<script setup lang="ts">
import {
  XhStatisticLabel,
  XhStatisticPrefix,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px">
    <XhStatisticRoot v-for="t in tones" :key="t" :tone="t">
      <XhStatisticLabel>{{ t }}</XhStatisticLabel>
      <XhStatisticPrefix>↑</XhStatisticPrefix>
      <XhStatisticValue>24.8</XhStatisticValue>
      <XhStatisticSuffix>%</XhStatisticSuffix>
    </XhStatisticRoot>
  </div>
</template>
