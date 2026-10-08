var e=`<!-- 平移缩放 | zoom 打开画布的平移缩放：按住 Ctrl（⌘）滚动缩放，放大后拖动空白处平移，焦点在图上时按 + / − / 0 -->
<script setup lang="ts">
import { XhGraphChartRoot } from "@xihan-ui/vue";

// 四个社群，每个五人
const people = [
  { id: "a1", name: "阿岚", group: "甲" },
  { id: "a2", name: "阿杰", group: "甲" },
  { id: "a3", name: "阿宁", group: "甲" },
  { id: "a4", name: "阿泽", group: "甲" },
  { id: "a5", name: "阿敏", group: "甲" },
  { id: "b1", name: "北辰", group: "乙" },
  { id: "b2", name: "北川", group: "乙" },
  { id: "b3", name: "北原", group: "乙" },
  { id: "b4", name: "北岳", group: "乙" },
  { id: "b5", name: "北野", group: "乙" },
  { id: "c1", name: "晨光", group: "丙" },
  { id: "c2", name: "晨曦", group: "丙" },
  { id: "c3", name: "晨星", group: "丙" },
  { id: "c4", name: "晨雨", group: "丙" },
  { id: "c5", name: "晨风", group: "丙" },
  { id: "d1", name: "东篱", group: "丁" },
  { id: "d2", name: "东方", group: "丁" },
  { id: "d3", name: "东山", group: "丁" },
  { id: "d4", name: "东海", group: "丁" },
  { id: "d5", name: "东林", group: "丁" },
];

// 社群内两两相识，社群之间只有几条桥
const ties = [
  { source: "a1", target: "a2" },
  { source: "a1", target: "a3" },
  { source: "a2", target: "a4" },
  { source: "a3", target: "a5" },
  { source: "a4", target: "a5" },
  { source: "a2", target: "a3" },
  { source: "b1", target: "b2" },
  { source: "b1", target: "b3" },
  { source: "b2", target: "b4" },
  { source: "b3", target: "b5" },
  { source: "b4", target: "b5" },
  { source: "b1", target: "b4" },
  { source: "c1", target: "c2" },
  { source: "c1", target: "c3" },
  { source: "c2", target: "c4" },
  { source: "c3", target: "c5" },
  { source: "c4", target: "c5" },
  { source: "c2", target: "c5" },
  { source: "d1", target: "d2" },
  { source: "d1", target: "d3" },
  { source: "d2", target: "d4" },
  { source: "d3", target: "d5" },
  { source: "d4", target: "d5" },
  { source: "d1", target: "d5" },
  { source: "a1", target: "b1" },
  { source: "b5", target: "c1" },
  { source: "c5", target: "d1" },
  { source: "d4", target: "a5" },
];
<\/script>

<template>
  <XhGraphChartRoot
    :nodes="people"
    :links="ties"
    :zoom="true"
  >
    <template #caption>四个社群之间的往来</template>
  </XhGraphChartRoot>
</template>
`;export{e as default};