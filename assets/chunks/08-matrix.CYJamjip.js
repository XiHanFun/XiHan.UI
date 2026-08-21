const n=`<!-- 矩阵形态 | 行列都由作者给，数据按行列定位而不按日期：星期 × 时段的活跃度 -->
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";

const rows = ["周一", "周二", "周三", "周四", "周五"];
const columns = ["09:00", "12:00", "15:00", "18:00", "21:00"];
const traffic = [
  { row: "周一", column: "09:00", value: 12 },
  { row: "周一", column: "12:00", value: 30 },
  { row: "周一", column: "18:00", value: 22 },
  { row: "周二", column: "12:00", value: 26 },
  { row: "周二", column: "21:00", value: 9 },
  { row: "周三", column: "09:00", value: 6 },
  { row: "周三", column: "15:00", value: 18 },
  { row: "周四", column: "12:00", value: 34 },
  { row: "周四", column: "18:00", value: 28 },
  { row: "周五", column: "15:00", value: 14 },
  { row: "周五", column: "18:00", value: 40 },
  { row: "周五", column: "21:00", value: 25 },
];
<\/script>

<template>
  <!-- 行名与列名都是真表头，读屏报某一格时会连着念出它属于哪一行哪一列 -->
  <XhHeatmapRoot
    variant="matrix"
    :rows="rows"
    :columns="columns"
    :value="traffic"
    style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px"
  />
</template>
`;export{n as default};
