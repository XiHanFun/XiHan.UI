const n=`<!-- 箱线与小提琴 | mark: 'boxplot' 按 x 分组统计原始值，画出中位数、四分位与离群点；style="violin" 画分布的轮廓 -->
<script setup lang="ts">
import { XhCartesianChartRoot, XhSwitch } from "@xihan-ui/vue";
import { computed, ref } from "vue";

// 三个机房各 60 次请求的耗时，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const rooms = ["北京", "上海", "广州"];
const samples = rooms.flatMap((room, r) =>
  Array.from({ length: 60 }, (_, i) => ({
    room,
    ms: Math.round(90 + r * 25 + (noise(r * 60 + i) + noise(r * 60 + i + 500)) * (40 + r * 20) + (i % 23 === 0 ? 180 : 0)),
  })),
);

const violin = ref(false);
const series = computed(() => [{ mark: "boxplot", x: "room", y: "ms", name: "耗时", style: violin.value ? "violin" : "box" }] as const);
<\/script>

<template>
  <div :style="{ display: 'grid', gap: 'var(--xh-space-4)', width: '100%' }">
    <label :style="{ display: 'flex', alignItems: 'center', gap: 'var(--xh-space-2)' }">
      <XhSwitch v-model:checked="violin" />
      小提琴
    </label>
    <XhCartesianChartRoot :data="samples" :series="series" :y-axis="{ title: '毫秒' }">
      <template #caption>各机房请求耗时</template>
    </XhCartesianChartRoot>
  </div>
</template>
`;export{n as default};
