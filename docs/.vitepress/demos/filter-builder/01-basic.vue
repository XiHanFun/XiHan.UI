<!-- 基础用法 | 组里是条件，每个条件是字段、运算符与值；运算符按字段类型给出，值的控件随运算符换，增删改都派发一棵新树 -->
<script setup lang="ts">
import type { FilterField, FilterGroup } from "@xihan-ui/viz";
import { XhFilterBuilderRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const fields: FilterField[] = [
  { name: "region", type: "string", label: "区域", options: [{ value: "east", label: "华东" }, { value: "south", label: "华南" }, { value: "north", label: "华北" }] },
  { name: "customer", type: "string", label: "客户" },
  { name: "amount", type: "number", label: "金额" },
  { name: "orderedAt", type: "date", label: "下单日期" },
  { name: "paid", type: "boolean", label: "已付款" },
];
const filter = ref<FilterGroup>({
  logic: "and",
  conditions: [
    { field: "region", operator: "eq", value: "east" },
    { field: "amount", operator: "between", value: [1000, 5000] },
  ],
});
</script>

<template>
  <XhFilterBuilderRoot v-model:value="filter" :fields="fields" aria-label="订单筛选" />
  <p data-demo-output>值：{{ JSON.stringify(filter) }}</p>
</template>
