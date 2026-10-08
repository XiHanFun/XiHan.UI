var e=`<!-- 相对第一阶段 | conversion="first" 让每个阶段写相对第一阶段的转化率：读者关心从头到尾留下多少 -->
<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

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
    conversion="first"
  >
    <template #caption>本月购买流程</template>
  </XhFunnelChartRoot>
</template>
`;export{e as default};