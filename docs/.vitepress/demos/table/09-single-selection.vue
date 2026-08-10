<!-- 单选 | selectionMode 给 single：选中集合最多一个元素，点已选中的那行再点一次就清空，焦点行按空格同理 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
} from "@xihan-ui/vue";

// 单选下全选把手不生效，表头那一格空着即可
const columns = [
  { id: "select", width: "3rem" },
  { id: "plan", label: "套餐", width: "8rem" },
  { id: "price", label: "价格" },
];

const plans = [
  { id: "p1", plan: "入门版", price: "¥ 0 / 月" },
  { id: "p2", plan: "团队版", price: "¥ 99 / 月" },
  { id: "p3", plan: "企业版", price: "¥ 399 / 月" },
];

const rows = plans.map((p) => ({ id: p.id }));

const selection = ref<string[]>(["p2"]);
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhTableRoot
      v-model:selection="selection"
      :columns="columns"
      :rows="rows"
      selection-mode="single"
    >
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="select" />
          <XhTableColumnHeader value="plan">套餐</XhTableColumnHeader>
          <XhTableColumnHeader value="price">价格</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="p in plans" :key="p.id" :value="p.id">
          <XhTableCell value="select">
            <XhTableRowSelectTrigger>●</XhTableRowSelectTrigger>
          </XhTableCell>
          <XhTableCell value="plan">{{ p.plan }}</XhTableCell>
          <XhTableCell value="price">{{ p.price }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>已选：{{ selection.length ? selection.join("、") : "（无）" }}</span>
  </div>
</template>
