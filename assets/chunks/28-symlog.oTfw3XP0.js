const t=`<!-- 对称对数轴 | yAxis.scale 写 symlog：长尾数据跨越正负、含 0 也画得出，0 附近铺得开、尾部压得住；还有 sqrt 与 pow（指数写 exponent） -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

const changes = [
  { store: "华北", delta: -1800 },
  { store: "华东", delta: -40 },
  { store: "华中", delta: 0 },
  { store: "华南", delta: 12 },
  { store: "西南", delta: 260 },
  { store: "西北", delta: 9600 },
];

const series = [{ mark: "bar", x: "store", y: "delta", name: "库存变化" }] as const;

// 对称对数：线性轴上 9600 会把其余几根压成一条线，对数轴又画不了负数与 0
const yAxis = { scale: "symlog" } as const;
<\/script>

<template>
  <XhCartesianChartRoot
    :data="changes"
    :series="series"
    :y-axis="yAxis"
  >
    <template #caption>各仓库本周库存变化（件）</template>
  </XhCartesianChartRoot>
</template>
`;export{t as default};
