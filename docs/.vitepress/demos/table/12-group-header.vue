<!-- 多行表头与表头分组 | 表头写几行就是几行；分组格的跨列数与两行表头的行号由标记自报，columns 仍只登记叶子列 -->
<script setup lang="ts">
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

// 只有叶子列进 columns：列号与列总数按它算
const columns = [
  { id: "team", label: "小组", width: "8rem" },
  { id: "q1", label: "Q1", width: "5rem" },
  { id: "q2", label: "Q2", width: "5rem" },
  { id: "q3", label: "Q3", width: "5rem" },
  { id: "q4", label: "Q4", width: "5rem" },
];

const teams = [
  { id: "t1", team: "平台研发", q1: 12, q2: 15, q3: 18, q4: 21 },
  { id: "t2", team: "前端体验", q1: 9, q2: 11, q3: 14, q4: 16 },
  { id: "t3", team: "基础架构", q1: 7, q2: 8, q3: 10, q4: 12 },
];

const rows = teams.map((t) => ({ id: t.id }));

// 分组格宽度取两列之和，伸缩系数也翻倍，两行表头才对得齐
const groupStyle = { inlineSize: "10rem", flexGrow: 2 };
</script>

<template>
  <div style="width: 100%; max-width: 620px">
    <!-- 表头占两行，行号空间比缺省的多一行，总行数在这里自报 -->
    <XhTableRoot :columns="columns" :rows="rows" :aria-rowcount="teams.length + 2">
      <XhTableCaption>季度交付单量</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="team" />
          <XhTableColumnHeader value="q1" :style="groupStyle" :aria-colspan="2">
            上半年
          </XhTableColumnHeader>
          <XhTableColumnHeader value="q3" :style="groupStyle" :aria-colspan="2">
            下半年
          </XhTableColumnHeader>
        </XhTableRow>
        <!-- 第二行表头自报行号：缺省那条恒为 1 -->
        <XhTableRow :aria-rowindex="2">
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <!-- 数据行也往后挪一行 -->
        <XhTableRow
          v-for="(t, i) in teams"
          :key="t.id"
          :value="t.id"
          :aria-rowindex="i + 3"
        >
          <XhTableCell value="team">{{ t.team }}</XhTableCell>
          <XhTableCell value="q1">{{ t.q1 }}</XhTableCell>
          <XhTableCell value="q2">{{ t.q2 }}</XhTableCell>
          <XhTableCell value="q3">{{ t.q3 }}</XhTableCell>
          <XhTableCell value="q4">{{ t.q4 }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
  </div>
</template>
