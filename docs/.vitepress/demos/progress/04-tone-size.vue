<!-- 语气与尺寸 | tone 决定进度段用哪族颜色，不写时沿用品牌色；size 只改变轨道厚度，不写即默认中档 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="width: 100%; display: grid; gap: var(--xh-space-6)">
    <div style="display: grid; gap: var(--xh-space-3)">
      <div v-for="t in tones" :key="t" style="display: flex; gap: var(--xh-space-3); align-items: center">
        <span style="min-width: 64px; font-size: var(--xh-text-caption-size); color: var(--xh-fg-muted)">{{ t }}</span>
        <XhProgress :value="65" :tone="t" style="flex: 1" />
      </div>
    </div>

    <div style="display: grid; gap: var(--xh-space-4)">
      <div style="display: flex; gap: var(--xh-space-3); align-items: center">
        <span style="min-width: 64px; font-size: var(--xh-text-caption-size); color: var(--xh-fg-muted)">sm</span>
        <XhProgress :value="65" size="sm" style="flex: 1" />
      </div>
      <div style="display: flex; gap: var(--xh-space-3); align-items: center">
        <span style="min-width: 64px; font-size: var(--xh-text-caption-size); color: var(--xh-fg-muted)">缺省</span>
        <XhProgress :value="65" style="flex: 1" />
      </div>
      <div style="display: flex; gap: var(--xh-space-3); align-items: center">
        <span style="min-width: 64px; font-size: var(--xh-text-caption-size); color: var(--xh-fg-muted)">lg</span>
        <XhProgress :value="65" size="lg" style="flex: 1" />
      </div>
    </div>
  </div>
</template>
