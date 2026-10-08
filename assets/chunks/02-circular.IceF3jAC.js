var e=`<!-- 环形 | layout="circular" 把节点按分组排在一个圆上：组与组之间有多少连线一眼看得出 -->
<script setup lang="ts">
import { XhGraphChartRoot } from "@xihan-ui/vue";

const services = [
  { id: "gateway", name: "网关", group: "接入" },
  { id: "auth", name: "认证", group: "接入" },
  { id: "user", name: "用户", group: "业务" },
  { id: "order", name: "订单", group: "业务" },
  { id: "pay", name: "支付", group: "业务" },
  { id: "stock", name: "库存", group: "业务" },
  { id: "notify", name: "通知", group: "业务" },
  { id: "user-db", name: "用户库", group: "数据" },
  { id: "order-db", name: "订单库", group: "数据" },
  { id: "cache", name: "缓存", group: "数据" },
  { id: "mq", name: "消息队列", group: "数据" },
];

const calls = [
  { source: "gateway", target: "auth" },
  { source: "gateway", target: "user" },
  { source: "gateway", target: "order" },
  { source: "order", target: "pay" },
  { source: "order", target: "stock" },
  { source: "order", target: "notify" },
  { source: "pay", target: "notify" },
  { source: "user", target: "user-db" },
  { source: "order", target: "order-db" },
  { source: "user", target: "cache" },
  { source: "order", target: "cache" },
  { source: "notify", target: "mq" },
  { source: "pay", target: "mq" },
];
<\/script>

<template>
  <XhGraphChartRoot
    :nodes="services"
    :links="calls"
    layout="circular"
  >
    <template #caption>服务调用关系</template>
  </XhGraphChartRoot>
</template>
`;export{e as default};