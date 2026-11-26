<!-- 数据写法 | 只给 collection、不写结构时按标准结构铺：一组一格，dt 标签与 dd 取值照数据成对，span 让一格横跨几列 -->
<script setup lang="ts">
import type { DescriptionsNode } from "@xihan-ui/headless";
import { XhDescriptionsRoot } from "@xihan-ui/vue";

const order: DescriptionsNode[] = [
  { label: "订单号", content: "XH-20260810-0042" },
  { label: "下单时间", content: "2026-08-10 09:31" },
  { label: "支付方式", content: "余额支付" },
  { label: "商品件数", content: 3 },
  { label: "收货地址", content: "浙江省杭州市余杭区文一西路 969 号", span: 2 },
];
</script>

<template>
  <XhDescriptionsRoot :collection="order" :columns="2" style="max-inline-size: 560px" />
</template>
