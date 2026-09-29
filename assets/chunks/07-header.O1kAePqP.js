const e=`<!-- 标题与附加内容 | 列表之前的头部放标题与作用于整份描述的操作；它排在 dl 之外，标题标签按页面层级由作者选 -->
<script setup lang="ts">
import {
  XhButton,
  XhDescriptionsExtra,
  XhDescriptionsHeader,
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsTitle,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const order = [
  { label: "订单号", value: "XH-20260810-0042" },
  { label: "下单时间", value: "2026-08-10 09:31" },
  { label: "支付方式", value: "余额支付" },
  { label: "收货人", value: "林一" },
];
<\/script>

<template>
  <XhDescriptionsRoot :columns="2" variant="outline" style="max-inline-size: 560px">
    <template #header>
      <XhDescriptionsHeader>
        <XhDescriptionsTitle as="h3">订单信息</XhDescriptionsTitle>
        <XhDescriptionsExtra>
          <XhButton variant="outline" size="sm">编辑</XhButton>
        </XhDescriptionsExtra>
      </XhDescriptionsHeader>
    </template>
    <XhDescriptionsItem v-for="row in order" :key="row.label">
      <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
      <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
`;export{e as default};
