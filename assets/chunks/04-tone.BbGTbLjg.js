const n=`<!-- 语气 | tone 决定进度段用哪族颜色，不写时沿用品牌色 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <div v-for="t in tones" :key="t" style="display: flex; gap: 12px; align-items: center">
      <span style="min-width: 64px; font-size: 13px; opacity: 0.7">{{ t }}</span>
      <XhProgress :value="65" :tone="t" style="flex: 1" />
    </div>
  </div>
</template>
`;export{n as default};
