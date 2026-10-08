var e=`<!-- 单元格合并 | cellSpan 逐格询问合并区的大小：部门列按连续相同的值纵向合并，汇总行的两个季度横向合并；作者照常逐格渲染，被合并掉的格子由表格收起或留成占位 -->
<script setup lang="ts">
import type { TableCellSpan, TableCellSpanDetails } from "@xihan-ui/headless";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "dept", label: "部门", width: "7rem" },
  { id: "name", label: "姓名", width: "7rem" },
  { id: "q1", label: "Q1", width: "5rem" },
  { id: "q2", label: "Q2", width: "5rem" },
];

const people = [
  { id: "p1", dept: "研发", name: "赵一", q1: "12", q2: "15" },
  { id: "p2", dept: "研发", name: "钱二", q1: "9", q2: "11" },
  { id: "p3", dept: "研发", name: "孙三", q1: "7", q2: "10" },
  { id: "p4", dept: "运维", name: "李四", q1: "5", q2: "6" },
  { id: "p5", dept: "运维", name: "周五", q1: "4", q2: "8" },
  { id: "sum", dept: "合计", name: "—", q1: "上半年 104", q2: "" },
];

const rows = people.map(p => ({ id: p.id }));

// 部门列：同一部门的第一行往下合并到这个部门的最后一行；汇总行的 Q1 横跨两列
function cellSpan({ row, rowIndex, column }: TableCellSpanDetails): TableCellSpan | null {
  const person = people[rowIndex]!;
  if (column.id === "dept" && row.id !== "sum") {
    if (rowIndex > 0 && people[rowIndex - 1]!.dept === person.dept)
      return null;
    let span = 1;
    while (people[rowIndex + span]?.dept === person.dept)
      span += 1;
    return { rowSpan: span };
  }
  if (row.id === "sum" && column.id === "q1")
    return { colSpan: 2 };
  return null;
}
<\/script>

<template>
  <div style="width: 100%; max-width: 560px">
    <XhTableRoot :columns="columns" :rows="rows" :cell-span="cellSpan" ruled>
      <XhTableCaption>季度交付单量</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <XhTableColumnLabel>{{ col.label }}</XhTableColumnLabel>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="p in people" :key="p.id" :value="p.id">
          <XhTableCell v-for="col in columns" :key="col.id" :value="col.id">
            {{ p[col.id as keyof typeof p] }}
          </XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
  </div>
</template>
`;export{e as default};