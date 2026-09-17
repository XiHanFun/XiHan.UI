<script setup lang="ts">
import { XhDescriptionsItem, XhDescriptionsLabel, XhDescriptionsRoot, XhDescriptionsValue } from "@xihan-ui/vue";

const order = [
  { label: "订单号", value: "XH-0042" },
  { label: "下单时间", value: "08-10 09:31" },
];
</script>

<template>
  <XhDescriptionsRoot style="inline-size: var(--xh-doc-catalog-w)">
    <XhDescriptionsItem v-for="row in order" :key="row.label">
      <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
      <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
