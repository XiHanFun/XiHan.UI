<!-- 常用比例 | 同样的列宽下，1 : 1、4 : 3、16 : 9 各按自己的比例定高，并排时也不被拉成同一个高 -->
<script setup lang="ts">
import { XhAspectRatio } from "@xihan-ui/vue";

const ratios = [
  { value: 1, tone: "brand" },
  { value: 4 / 3, tone: "info" },
  { value: 16 / 9, tone: "success" },
] as const;
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--xh-layout-col-min-xs), 1fr));
      gap: var(--xh-space-3);
      inline-size: 100%;
    "
  >
    <XhAspectRatio v-for="ratio in ratios" :key="ratio.value" :ratio="ratio.value">
      <span data-demo-block :data-tone="ratio.tone" style="--xh-demo-block-block-size: 100%" />
    </XhAspectRatio>
  </div>
</template>
