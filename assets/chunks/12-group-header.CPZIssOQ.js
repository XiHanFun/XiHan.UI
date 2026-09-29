const e=`<!-- 多级表头与表头分组 | 列给出 children 即为分组：表头按 headerRows 逐层渲染，分组格的跨列数、行号与较浅列头的纵向跨行都由表格算出 -->
<script setup lang="ts">
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

// 分组只在表头占格：列号、列宽与数据都按叶子列算，分组内的叶子列要给出宽度
const columns = [
  { id: "team", label: "小组", width: "8rem" },
  {
    id: "h1",
    label: "上半年",
    children: [
      { id: "q1", label: "Q1", width: "5rem" },
      { id: "q2", label: "Q2", width: "5rem" },
    ],
  },
  {
    id: "h2",
    label: "下半年",
    children: [
      { id: "q3", label: "Q3", width: "5rem" },
      { id: "q4", label: "Q4", width: "5rem" },
    ],
  },
];

const teams = [
  { id: "t1", team: "平台研发", q1: 12, q2: 15, q3: 18, q4: 21 },
  { id: "t2", team: "前端体验", q1: 9, q2: 11, q3: 14, q4: 16 },
  { id: "t3", team: "基础架构", q1: 7, q2: 8, q3: 10, q4: 12 },
];

const rows = teams.map(t => ({ id: t.id }));
const leaves = ["team", "q1", "q2", "q3", "q4"] as const;
<\/script>

<template>
  <div style="width: 100%; max-width: 620px">
    <XhTableRoot v-slot="{ headerRows }" :columns="columns" :rows="rows">
      <XhTableCaption>季度交付单量</XhTableCaption>
      <XhTableHeader>
        <!-- 每层一行，写明第几行；「小组」在第一行纵向跨满两行，第二行那一格是占位，照样渲 -->
        <XhTableRow v-for="(cells, i) in headerRows" :key="i" :level="i + 1">
          <XhTableColumnHeader v-for="cell in cells" :key="cell.id" :value="cell.id">
            <XhTableColumnLabel>{{ cell.label }}</XhTableColumnLabel>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="t in teams" :key="t.id" :value="t.id">
          <XhTableCell v-for="id in leaves" :key="id" :value="id">{{ t[id] }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
  </div>
</template>
`;export{e as default};
