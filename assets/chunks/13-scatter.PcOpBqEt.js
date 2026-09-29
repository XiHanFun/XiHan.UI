const n=`<!-- 散点 | 每行一个点，看两个量有没有关系、点在哪里扎堆；两个系列的点形状也不同 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

// 两个班各 20 名学生的每周学习时长与成绩，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const students = Array.from({ length: 40 }, (_, i) => {
  const hours = Math.round((2 + noise(i) * 12) * 10) / 10;
  const score = Math.round(50 + hours * 3 + (i % 2 ? 6 : 0) + (noise(i + 100) - 0.5) * 20);
  return i % 2 ? { hours, second: score } : { hours, first: score };
});

// 一个班一个系列：y 字段缺失的行不属于这个系列
const series = [
  { mark: "scatter", x: "hours", y: "first", name: "一班" },
  { mark: "scatter", x: "hours", y: "second", name: "二班" },
] as const;
<\/script>

<template>
  <XhCartesianChartRoot
    :data="students"
    :series="series"
    :x-axis="{ title: '每周学习时长（小时）' }"
    :y-axis="{ title: '成绩' }"
  >
    <template #caption>学习时长与成绩</template>
  </XhCartesianChartRoot>
</template>
`;export{n as default};
