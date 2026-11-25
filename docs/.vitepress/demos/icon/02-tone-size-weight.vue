<!-- 语气、尺寸与描边 | tone 使用语义颜色；size 设置图标大小，weight 设置描边粗细 -->
<script setup lang="ts">
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";

const tones = ["brand", "success", "warning", "danger", "info"] as const;
const sizes = ["text", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-4)">
    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <XhIcon v-for="tone in tones" :key="tone" :icon="StarIcon" :tone="tone" size="lg" />
    </div>

    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <XhIcon v-for="size in sizes" :key="size" :icon="StarIcon" :size="size" />
    </div>

    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <XhIcon :icon="StarIcon" size="lg" weight="light" />
      <XhIcon :icon="StarIcon" size="lg" />
      <XhIcon :icon="StarIcon" size="lg" weight="bold" />
    </div>
  </div>
</template>
