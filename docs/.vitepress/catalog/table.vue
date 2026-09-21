<script setup lang="ts">
import { XhTableBody, XhTableCell, XhTableColumnHeader, XhTableColumnLabel, XhTableHeader, XhTableRoot, XhTableRow } from "@xihan-ui/vue";

const columns = [
  { id: "name", label: "姓名" },
  { id: "dept", label: "部门" },
  { id: "level", label: "职级" },
];
const members = [
  { id: "u1", name: "赵一", dept: "平台研发", level: "P6" },
  { id: "u2", name: "钱二", dept: "前端体验", level: "P7" },
  { id: "u3", name: "孙三", dept: "基础架构", level: "P6" },
];
const rows = members.map(m => ({ id: m.id }));
</script>

<template>
  <XhTableRoot :columns="columns" :rows="rows" style="inline-size: var(--xh-doc-catalog-w)">
    <XhTableHeader>
      <XhTableRow>
        <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id"><XhTableColumnLabel>{{ col.label }}</XhTableColumnLabel></XhTableColumnHeader>
      </XhTableRow>
    </XhTableHeader>
    <XhTableBody>
      <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
        <XhTableCell value="name">{{ m.name }}</XhTableCell>
        <XhTableCell value="dept">{{ m.dept }}</XhTableCell>
        <XhTableCell value="level">{{ m.level }}</XhTableCell>
      </XhTableRow>
    </XhTableBody>
  </XhTableRoot>
</template>
