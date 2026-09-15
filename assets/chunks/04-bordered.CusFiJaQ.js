const e=`<!-- 外框 | bordered 画一圈描边，并在格与格之间补上网格线 -->
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const rows = [
  { label: "商品", value: "机械键盘" },
  { label: "单价", value: "￥499.00" },
  { label: "数量", value: "2" },
  { label: "小计", value: "￥998.00" },
];
<\/script>

<template>
  <XhDescriptionsRoot bordered :columns="2" placement="left">
    <XhDescriptionsItem v-for="row in rows" :key="row.label">
      <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
      <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
`;export{e as default};
