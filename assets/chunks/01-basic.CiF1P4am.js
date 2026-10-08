var e=`<!-- 基础用法 | 一行数据一个阶段、按先后排好：宽度与数值成正比，相邻阶段之间写出相对上一阶段的转化率 -->
<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

// 每行一个阶段，次序就是流程的先后
const steps = [
  { stage: "浏览商品", users: 12800 },
  { stage: "加入购物车", users: 5200 },
  { stage: "提交订单", users: 2300 },
  { stage: "完成支付", users: 1850 },
  { stage: "再次购买", users: 620 },
];
<\/script>

<template>
  <XhFunnelChartRoot
    :data="steps"
    name-field="stage"
    value-field="users"
  >
    <template #caption>本月购买流程</template>
  </XhFunnelChartRoot>
</template>
`;export{e as default};