const t=`<!-- 色板换色 | palette 直接按颜色点名，六个色板只换色阶满档那一端，分档与空格底都不动 -->
<script setup lang="ts">
import type { HeatmapPalette } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

// 同一份数据铺六遍，肉眼比的就只有颜色这一件事
const activity = [
  { date: "2024-01-02", count: 1 },
  { date: "2024-01-04", count: 3 },
  { date: "2024-01-08", count: 6 },
  { date: "2024-01-11", count: 2 },
  { date: "2024-01-15", count: 9 },
  { date: "2024-01-17", count: 4 },
  { date: "2024-01-22", count: 12 },
  { date: "2024-01-25", count: 7 },
  { date: "2024-01-27", count: 2 },
];

const palettes: HeatmapPalette[] = ["green", "blue", "orange", "purple", "red", "gray"];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px">
    <div v-for="palette in palettes" :key="palette" style="display: grid; gap: 4px">
      <span style="color: var(--xh-fg-subtle); font-size: 12px">{{ palette }}</span>
      <!-- 只写 palette：色板管的只有满档实心底那一端，档位怎么分与它无关 -->
      <XhHeatmapRoot
        :value="activity"
        start-date="2024-01-01"
        end-date="2024-01-28" :palette="palette"
      />
    </div>
  </div>
</template>
`;export{t as default};
