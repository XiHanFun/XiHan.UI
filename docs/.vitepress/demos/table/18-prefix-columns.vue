<!-- 前缀列与分页序号 | prefix-columns 让库把序号/多选列插在最前面并占住列号；序号是分页全局序号，翻到第二页不会又从 1 开始 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
} from "@xihan-ui/vue";

const columns = [
  { id: "name", label: "名称" },
  { id: "owner", label: "负责人" },
  { id: "status", label: "状态" },
];

const all = Array.from({ length: 43 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `资源 ${i + 1}`,
  owner: ["曦寒", "碧落", "葳蕤"][i % 3],
  status: i % 4 === 0 ? "停用" : "启用",
}));

const page = ref(1);
const pageSize = 10;
// 切片归调用方（或分页组件的 api.slice）：表格只拿 page/pageSize 算序号
const pageRows = computed(() => all.slice((page.value - 1) * pageSize, page.value * pageSize));
const selection = ref<string[]>([]);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhTableRoot
      v-slot="{ columns: cols, rowNumber }"
      :columns="columns"
      :rows="pageRows.map((r) => ({ id: r.id }))"
      :prefix-columns="['index', 'select']"
      :page="page"
      :page-size="pageSize"
      v-model:selection="selection"
      selection-mode="multiple"
      striped
    >
      <XhTableHeader>
        <XhTableRow value="__head__">
          <XhTableColumnHeader v-for="c in cols" :key="c.id" :value="c.id">
            <XhTableSelectAllTrigger v-if="c.kind === 'select'" />
            <template v-else-if="c.kind === 'index'">#</template>
            <template v-else>{{ c.label }}</template>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>

      <XhTableBody>
        <XhTableRow v-for="row in pageRows" :key="row.id" :value="row.id">
          <XhTableCell v-for="c in cols" :key="c.id" :value="c.id" :row="row.id">
            <XhTableRowSelectTrigger v-if="c.kind === 'select'" :value="row.id" />
            <template v-else-if="c.kind === 'index'">{{ rowNumber(row.id) }}</template>
            <template v-else>{{ (row as Record<string, string>)[c.id] }}</template>
          </XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>

    <XhPaginationRoot
      v-slot="{ pages }"
      v-model:page="page"
      :count="all.length"
      :page-size="pageSize"
      style="display: flex; gap: 4px"
    >
      <XhPaginationPrevTrigger />
      <template v-for="(p, i) in pages" :key="`${p}-${i}`">
        <XhPaginationEllipsis v-if="p === 'ellipsis'" />
        <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
      </template>
      <XhPaginationNextTrigger />
    </XhPaginationRoot>

    <span style="font-size: 13px">已选 {{ selection.length }} 项 · 序号跨页连续</span>
  </div>
</template>
