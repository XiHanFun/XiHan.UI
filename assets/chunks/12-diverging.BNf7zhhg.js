var e=`<!-- 发散色阶 | 数据里有负数时以 0 为中点分两侧着色：相关系数矩阵，负相关与正相关各走一种颜色 -->
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";

const metrics = ["时长", "页数", "跳出", "转化"];
// 对角线是自己和自己，恒为 1；其余两两之间在 ±1 之间
const correlation = [
  { row: "时长", column: "时长", value: 1 },
  { row: "时长", column: "页数", value: 0.72 },
  { row: "时长", column: "跳出", value: -0.65 },
  { row: "时长", column: "转化", value: 0.41 },
  { row: "页数", column: "时长", value: 0.72 },
  { row: "页数", column: "页数", value: 1 },
  { row: "页数", column: "跳出", value: -0.58 },
  { row: "页数", column: "转化", value: 0.36 },
  { row: "跳出", column: "时长", value: -0.65 },
  { row: "跳出", column: "页数", value: -0.58 },
  { row: "跳出", column: "跳出", value: 1 },
  { row: "跳出", column: "转化", value: -0.47 },
  { row: "转化", column: "时长", value: 0.41 },
  { row: "转化", column: "页数", value: 0.36 },
  { row: "转化", column: "跳出", value: -0.47 },
  { row: "转化", column: "转化", value: 1 },
];
<\/script>

<template>
  <!-- 不必写 scale：出现负数即按发散色阶，对照条两端的文字缺省就是两侧最远的数 -->
  <XhHeatmapRoot
    variant="matrix"
    :rows="metrics"
    :columns="metrics"
    :value="correlation"
    style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px"
  />
</template>
`;export{e as default};