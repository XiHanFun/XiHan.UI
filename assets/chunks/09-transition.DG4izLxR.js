const n=`<!-- 数据更新 | 换一组数据时柱从当前高度走到新高度，柱端的数随之滚动；关掉动画后直接画终态 -->
<script setup lang="ts">
import { XhButton, XhCartesianChartRoot, XhSwitch } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const months = ["一月", "二月", "三月", "四月", "五月", "六月"];
const years = [
  { year: 2024, online: [82, 96, 110, 104, 128, 140], store: [64, 70, 66, 72, 80, 78] },
  { year: 2025, online: [120, 132, 118, 150, 162, 176], store: [70, 62, 74, 68, 76, 82] },
  { year: 2026, online: [150, 144, 170, 186, 172, 204], store: [58, 66, 60, 54, 62, 70] },
];

const index = ref(0);
const animated = ref(true);
const current = computed(() => years[index.value]!);
// 同一批月份、不同的数：柱按月份对上，原地伸缩
const data = computed(() => months.map((month, i) => ({
  month,
  online: current.value.online[i],
  store: current.value.store[i],
})));
<\/script>

<template>
  <div :style="{ display: 'grid', gap: 'var(--xh-space-4)', width: '100%' }">
    <div :style="{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--xh-space-4)' }">
      <XhButton @click="index = (index + 1) % years.length">
        换一组数据
      </XhButton>
      <label :style="{ display: 'flex', alignItems: 'center', gap: 'var(--xh-space-2)' }">
        <XhSwitch v-model:checked="animated" />
        动画
      </label>
    </div>
    <XhCartesianChartRoot
      :data="data"
      :series="[
        { mark: 'bar', x: 'month', y: 'online', name: '线上', labels: 'end' },
        { mark: 'bar', x: 'month', y: 'store', name: '门店', labels: 'end' },
      ]"
      :animated="animated"
    >
      <template #caption>
        {{ current.year }} 年上半年销售额（万元）
      </template>
    </XhCartesianChartRoot>
  </div>
</template>
`;export{n as default};
