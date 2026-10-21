var e=`<!-- 行尾扩展位 | 给了 createId 的条件带 id，行尾留一个扩展位放宿主自己的控件，参数带上条件与路径 -->
<script setup lang="ts">
import type { FilterCondition, FilterField, FilterGroup } from "@xihan-ui/viz";
import { XhFilterBuilderRoot, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const fields: FilterField[] = [
  { name: "region", type: "string", label: "区域", options: [{ value: "east", label: "华东" }, { value: "south", label: "华南" }, { value: "north", label: "华北" }] },
  { name: "customer", type: "string", label: "客户" },
  { name: "amount", type: "number", label: "金额" },
  { name: "orderedAt", type: "date", label: "下单日期" },
  { name: "paid", type: "boolean", label: "已付款" },
];
// 条件上的 id 不属于筛选语义，组件原样保留
const seed: FilterGroup<FilterCondition & { readonly id: string }> = {
  logic: "and",
  conditions: [
    { id: "c1", field: "region", operator: "eq", value: "east" },
    { id: "c2", field: "amount", operator: "gt", value: 1000 },
  ],
};
const filter = ref<FilterGroup>(seed);
let seq = 2;
// 新建的条件与组按这个函数取 id，带 id 的条件才有扩展位
const createId = (kind: "condition" | "group"): string => \`\${kind === "condition" ? "c" : "g"}\${++seq}\`;
const idOf = (condition: FilterCondition): string => String((condition as { id?: unknown }).id);
<\/script>

<template>
  <XhFilterBuilderRoot v-model:value="filter" :fields="fields" :create-id="createId" aria-label="订单筛选">
    <template #condition-extra="{ condition }">
      <XhTagRoot size="sm">
        <XhTagLabel>{{ idOf(condition) }}</XhTagLabel>
      </XhTagRoot>
    </template>
  </XhFilterBuilderRoot>
  <p data-demo-output>值：{{ JSON.stringify(filter) }}</p>
</template>
`;export{e as default};