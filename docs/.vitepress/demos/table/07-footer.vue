<!-- 脚注合计 | footer 把行号空间的最后一行留给脚注；脚注单元格不属于任何数据行，也就没有选中与禁用可言 -->
<script setup lang="ts">
import { computed } from "vue";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableFooter,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "item", label: "条目", width: "10rem" },
  { id: "count", label: "数量", width: "5rem" },
  { id: "amount", label: "金额" },
];

const lines = [
  { id: "l1", item: "键盘", count: 2, amount: 1280 },
  { id: "l2", item: "鼠标", count: 3, amount: 447 },
  { id: "l3", item: "显示器支架", count: 1, amount: 320 },
];

const rows = lines.map((l) => ({ id: l.id }));

const totalCount = computed(() => lines.reduce((sum, l) => sum + l.count, 0));
const totalAmount = computed(() => lines.reduce((sum, l) => sum + l.amount, 0));
</script>

<template>
  <div style="width: 100%; max-width: 560px">
    <XhTableRoot :columns="columns" :rows="rows" footer>
      <XhTableCaption>采购清单</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="l in lines" :key="l.id" :value="l.id">
          <XhTableCell value="item">{{ l.item }}</XhTableCell>
          <XhTableCell value="count">{{ l.count }}</XhTableCell>
          <XhTableCell value="amount">¥ {{ l.amount }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
      <XhTableFooter>
        <!-- 脚注行不给 value：它占的是行号空间的最后一行 -->
        <XhTableRow>
          <XhTableCell value="item">合计</XhTableCell>
          <XhTableCell value="count">{{ totalCount }}</XhTableCell>
          <XhTableCell value="amount">¥ {{ totalAmount }}</XhTableCell>
        </XhTableRow>
      </XhTableFooter>
    </XhTableRoot>
  </div>
</template>
