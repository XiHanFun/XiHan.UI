<!-- 排序 | 列上标了 sortable 才认排序把手；按住 Shift 点是追加到排序链，裸点是整条链换成这一列 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableSortTrigger,
} from "@xihan-ui/vue";

interface Member {
  id: string;
  name: string;
  dept: string;
  level: string;
}

const columns = [
  { id: "name", label: "姓名", width: "8rem", sortable: true },
  { id: "dept", label: "部门", sortable: true },
  { id: "level", label: "职级", width: "6rem" },
];

const members: Member[] = [
  { id: "u1", name: "赵一", dept: "平台研发", level: "P6" },
  { id: "u2", name: "钱二", dept: "前端体验", level: "P7" },
  { id: "u3", name: "孙三", dept: "基础架构", level: "P6" },
  { id: "u4", name: "李四", dept: "前端体验", level: "P5" },
];

// 排序链是有序的：下标即优先级，第一个是主排序字段
const sort = ref<{ id: string; direction: "asc" | "desc" }[]>([]);

const sorted = computed(() => {
  if (!sort.value.length) return members;
  return [...members].sort((a, b) => {
    for (const s of sort.value) {
      const diff = String(a[s.id as keyof Member]).localeCompare(
        String(b[s.id as keyof Member]),
        "zh"
      );
      if (diff !== 0) return s.direction === "asc" ? diff : -diff;
    }
    return 0;
  });
});

// 行序的事实源跟着排序结果走
const rows = computed(() => sorted.value.map((m) => ({ id: m.id })));
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot v-model:sort="sort" :columns="columns" :rows="rows">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <XhTableSortTrigger v-if="col.sortable">{{ col.label }}</XhTableSortTrigger>
            <template v-else>{{ col.label }}</template>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in sorted" :key="m.id" :value="m.id">
          <XhTableCell value="name">{{ m.name }}</XhTableCell>
          <XhTableCell value="dept">{{ m.dept }}</XhTableCell>
          <XhTableCell value="level">{{ m.level }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>
      排序链：{{
        sort.length ? sort.map((s) => `${s.id} ${s.direction}`).join(" → ") : "（无）"
      }}
    </span>
  </div>
</template>
