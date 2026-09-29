const n=`<!-- 金字塔 | direction="up" 画成金字塔：第一阶段在最下面，往上逐级收窄；层级之间是包含关系，不写转化率 -->
<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

const steps = [
  { stage: "普通会员", users: 48000 },
  { stage: "银卡", users: 12500 },
  { stage: "金卡", users: 3100 },
  { stage: "钻石", users: 420 },
];
<\/script>

<template>
  <XhFunnelChartRoot
    :data="steps"
    name-field="stage"
    value-field="users"
    direction="up"
    conversion="none"
  >
    <template #caption>会员等级分布</template>
  </XhFunnelChartRoot>
</template>
`;export{n as default};
