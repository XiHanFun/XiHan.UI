<!-- 基础用法 | columns 是列号与列宽的唯一事实源，rows 是行序与行号的唯一事实源，标记只管长相 -->
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

const columns = [
  { id: "name", label: "姓名", width: "8rem" },
  { id: "dept", label: "部门" },
  { id: "level", label: "职级", width: "6rem" },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", level: "P6" },
  { id: "u2", name: "钱二", dept: "前端体验", level: "P7" },
  { id: "u3", name: "孙三", dept: "基础架构", level: "P6" },
  { id: "u4", name: "李四", dept: "质量保障", level: "P5" },
];

const rows = members.map((m) => ({ id: m.id }));
</script>

<template>
  <div style="width: 100%; max-width: 560px">
    <XhTableRoot :columns="columns" :rows="rows">
      <XhTableCaption>团队成员</XhTableCaption>
      <XhTableHeader>
        <!-- 表头行不给 value，它恒占行号空间的第 1 行 -->
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
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
  </div>
</template>
