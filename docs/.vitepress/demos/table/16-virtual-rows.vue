<!-- 只渲窗口内的行 | 全量 rows 照常交给 root（那只是行序与行号的元信息，不产生 DOM），标记里只渲可见那一段，首尾用两块空白撑出真实滚动高度 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

const columns = [
  { id: "no", label: "编号", width: "6rem" },
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门" },
];

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];

const people = Array.from({ length: 2000 }, (_, i) => ({
  id: `u${i + 1}`,
  no: `#${i + 1}`,
  name: `员工 ${i + 1}`,
  dept: depts[i % depts.length],
}));

// 行号与总数按全量算，与渲染了哪几行无关
const rows = people.map((p) => ({ id: p.id }));

// 行高写死才算得出窗口；上下各多渲几行做缓冲
const ROW_H = 36;
const WINDOW = 18;
const OVERSCAN = 4;

const start = ref(0);
const end = computed(() => Math.min(people.length, start.value + WINDOW));
const visible = computed(() => people.slice(start.value, end.value));

const bodyStyle = computed(() => ({
  paddingBlockStart: `${start.value * ROW_H}px`,
  paddingBlockEnd: `${(people.length - end.value) * ROW_H}px`,
}));

const rowStyle = { blockSize: `${ROW_H}px` };

function onScroll(event: Event): void {
  const top = (event.target as HTMLElement).scrollTop;
  const first = Math.floor(top / ROW_H) - OVERSCAN;
  start.value = Math.min(Math.max(0, first), Math.max(0, people.length - WINDOW));
}
</script>

<template>
  <div style="width: 100%; max-width: 520px; display: grid; gap: 12px">
    <!-- root 自己就是那个滚动容器，滚动量直接从它身上读 -->
    <XhTableRoot :columns="columns" :rows="rows" sticky-header @scroll="onScroll">
      <XhTableHeader>
        <XhTableRow :style="rowStyle">
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody :style="bodyStyle">
        <XhTableRow v-for="p in visible" :key="p.id" :value="p.id" :style="rowStyle">
          <XhTableCell value="no">{{ p.no }}</XhTableCell>
          <XhTableCell value="name">{{ p.name }}</XhTableCell>
          <XhTableCell value="dept">{{ p.dept }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>
      共 {{ people.length }} 行，此刻在 DOM 里的是第 {{ start + 1 }} –
      {{ end }} 行
    </span>
  </div>
</template>
