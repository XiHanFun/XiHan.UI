<script setup lang="ts">
import { XhDescriptionsItem, XhDescriptionsLabel, XhDescriptionsRoot, XhDescriptionsValue } from "@xihan-ui/vue";

const order = [
  { label: "订单号", value: "XH-0042" },
  { label: "下单时间", value: "08-10 09:31" },
  { label: "支付方式", value: "余额支付" },
];
</script>

<template>
  <XhDescriptionsRoot style="inline-size: 230px; font-size: 13px">
    <XhDescriptionsItem v-for="row in order" :key="row.label">
      <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
      <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
