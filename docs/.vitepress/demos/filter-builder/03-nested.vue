<!-- 嵌套的条件组 | 组里可以再套子组，表达「A 且（B 或 C）」；max-depth 限定层数，到上限时「加条件组」收起 -->
<script setup lang="ts">
import type { FilterBuilderField } from "@xihan-ui/headless";
import type { FilterGroup } from "@xihan-ui/viz";
import { XhFilterBuilderRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const fields: FilterBuilderField[] = [
  { name: "region", type: "string", label: "区域", options: [{ value: "east", label: "华东" }, { value: "south", label: "华南" }, { value: "north", label: "华北" }] },
  { name: "customer", type: "string", label: "客户" },
  { name: "amount", type: "number", label: "金额" },
  { name: "orderedAt", type: "date", label: "下单日期" },
  { name: "paid", type: "boolean", label: "已付款" },
];
const filter = ref<FilterGroup>({
  logic: "and",
  conditions: [
    { field: "paid", operator: "eq", value: true },
    {
      logic: "or",
      conditions: [
        { field: "region", operator: "in", value: ["east", "south"] },
        { field: "customer", operator: "contains", value: "集团" },
      ],
    },
  ],
});
</script>

<template>
  <XhFilterBuilderRoot v-model:value="filter" :fields="fields" :max-depth="1" aria-label="订单筛选" />
  <p data-demo-output>值：{{ JSON.stringify(filter) }}</p>
</template>
