<!-- 数据驱动 | 给 data 与 columns 就是一张会排序、会筛选、会分页的表：列 id 即字段名，排序、筛选与切页都由表格自己算，表后自动铺一组分页 -->
<script setup lang="ts">
import type { TableColumnDef } from "@xihan-ui/headless";
import { XhTableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const depts = ["平台研发", "前端体验", "基础架构", "质量保障"];
const levels = ["P5", "P6", "P7", "P8"];

interface Member {
  id: string;
  name: string;
  dept: string;
  level: string;
  joined: number;
}

// 列 id 即字段名：排序按字段值比，给了 filterOptions 的列在列头铺一颗筛选钮。
// 标上行类型后 id 只能写 Member 的字段，format 的 value 也是那个字段的类型
const columns: TableColumnDef<Member>[] = [
  { id: "name", label: "姓名", width: "8rem", sortable: true },
  { id: "dept", label: "部门", sortable: true, filterOptions: depts.map(value => ({ value })) },
  { id: "level", label: "职级", width: "6rem", sortable: true, filterOptions: levels.map(value => ({ value })) },
  { id: "joined", label: "入职", width: "6rem", sortable: true, format: value => `${value} 年` },
];

const members: Member[] = Array.from({ length: 36 }, (_, i) => ({
  id: `u${i + 1}`,
  name: `员工 ${i + 1}`,
  dept: depts[i % depts.length]!,
  level: levels[(i * 7) % levels.length]!,
  joined: 2016 + ((i * 5) % 9),
}));

const page = ref(1);
</script>

<template>
  <div style="width: 100%; max-width: 640px; display: grid; gap: 12px">
    <XhTableRoot
      v-model:page="page"
      :columns="columns"
      :data="members"
      :page-size="8"
      pagination
      aria-label="成员"
    />
    <span data-demo-output>第 {{ page }} 页</span>
  </div>
</template>
