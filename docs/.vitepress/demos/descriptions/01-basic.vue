<!-- 基础用法 | 根默认渲染成 dl，标签渲染成 dt、取值渲染成 dd；不传 columns 即每行一组 -->
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const order = [
  { label: "订单号", value: "XH-20260810-0042" },
  { label: "下单时间", value: "2026-08-10 09:31" },
  { label: "支付方式", value: "余额支付" },
];
</script>

<template>
  <XhDescriptionsRoot style="max-inline-size: 420px">
    <XhDescriptionsItem v-for="row in order" :key="row.label">
      <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
      <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
