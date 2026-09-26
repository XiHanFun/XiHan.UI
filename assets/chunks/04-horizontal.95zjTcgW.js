const t=`<!-- 横向条形图 | orientation="horizontal" 把整张图转置：类目名竖排可以读全，数值横向延伸 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

// 条形图的次序就是阅读次序：先按数值排好再交给组件，组件不排序
const tickets = [
  { team: "支付与结算平台", count: 184 },
  { team: "会员与营销中心", count: 152 },
  { team: "订单履约服务", count: 131 },
  { team: "商品与库存系统", count: 97 },
  { team: "客服工作台", count: 64 },
];
<\/script>

<template>
  <XhCartesianChartRoot
    :data="tickets"
    :series="[{ mark: 'bar', x: 'team', y: 'count', name: '工单数' }]"
    orientation="horizontal"
  >
    <template #caption>本月各团队工单数</template>
  </XhCartesianChartRoot>
</template>
`;export{t as default};
