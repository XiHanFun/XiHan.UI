<!-- 底框 | 用 frame 给图标套一层圆形底框：四种底框形态之外，tone 同时决定底框与图标的配色，sm、md、lg 三档底框与头像同档 -->
<script setup lang="ts">
import { CheckIcon, FolderIcon, StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";

const frames = ["solid", "subtle", "outline", "ghost"] as const;
const tones = ["brand", "success", "warning", "danger", "info"] as const;
const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-4)">
    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <XhIcon v-for="frame in frames" :key="frame" :icon="CheckIcon" :frame="frame" />
    </div>

    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <XhIcon v-for="tone in tones" :key="tone" :icon="StarIcon" frame="subtle" :tone="tone" />
    </div>

    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <XhIcon v-for="size in sizes" :key="size" :icon="FolderIcon" :size="size" frame="subtle" tone="brand" />
    </div>
  </div>
</template>
