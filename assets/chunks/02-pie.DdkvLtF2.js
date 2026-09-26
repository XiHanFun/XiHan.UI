const n=`<!-- 实心饼 | variant="pie" 去掉中心的空洞；扇区装得下时把占比写在扇区里 -->
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

// labels="inside" 把占比写在扇区里，装不下的扇区不写
const rows = [
  { channel: "搜索", visits: 4200 },
  { channel: "直接访问", visits: 2600 },
  { channel: "社交", visits: 1800 },
  { channel: "邮件", visits: 900 },
  { channel: "广告", visits: 500 },
];
<\/script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="channel"
    value-field="visits"
    variant="pie"
    labels="inside"
  >
    <template #caption>访问来源</template>
  </XhPieChartRoot>
</template>
`;export{n as default};
