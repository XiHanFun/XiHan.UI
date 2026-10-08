var e=`<!-- 靠左对齐 | align="start" 让阶段靠起始边对齐，逐级缩短看得更清楚 -->
<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

const steps = [
  { stage: "收到简历", users: 860 },
  { stage: "简历通过", users: 310 },
  { stage: "一面", users: 150 },
  { stage: "二面", users: 64 },
  { stage: "发放录用", users: 18 },
];
<\/script>

<template>
  <XhFunnelChartRoot
    :data="steps"
    name-field="stage"
    value-field="users"
    align="start"
    shape="bar"
  >
    <template #caption>招聘流程</template>
  </XhFunnelChartRoot>
</template>
`;export{e as default};