var e=`<!-- 树形表级联勾选 | cascade 与树的级联同一套算法：勾父行整枝带上，子行勾满父行跟着勾中、勾了一部分显示半选，禁用行的子树不动；对外值缺省只收叶行 -->
<script setup lang="ts">
import type { TableSelection } from "@xihan-ui/headless";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableExpandTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const columns = [
  { id: "select", width: "3rem" },
  { id: "name", label: "组织", width: "13rem" },
  { id: "owner", label: "负责人" },
];

const units = [
  { id: "rd", label: "研发中心", owner: "赵一", parentId: undefined },
  { id: "rd-web", label: "前端组", owner: "钱二", parentId: "rd" },
  { id: "rd-api", label: "服务端组", owner: "孙三", parentId: "rd" },
  { id: "rd-lab", label: "实验室（冻结）", owner: "李四", parentId: "rd", disabled: true },
  { id: "ops", label: "运维中心", owner: "周五", parentId: undefined },
  { id: "ops-sre", label: "稳定性组", owner: "吴六", parentId: "ops" },
];

const byId = new Map(units.map(unit => [unit.id, unit]));
const rows = units.map(unit => ({ id: unit.id, parentId: unit.parentId, disabled: unit.disabled }));
const selection = ref<TableSelection>([]);
<\/script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      v-slot="{ visibleRows }"
      v-model:selection="selection"
      :columns="columns"
      :rows="rows"
      :default-expanded-value="['rd', 'ops']"
      selection-mode="multiple"
      cascade
    >
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="select"><XhTableSelectAllTrigger /></XhTableColumnHeader>
          <XhTableColumnHeader value="name"><XhTableColumnLabel>组织</XhTableColumnLabel></XhTableColumnHeader>
          <XhTableColumnHeader value="owner"><XhTableColumnLabel>负责人</XhTableColumnLabel></XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow
          v-for="row in visibleRows.filter((item) => item.kind === 'data')"
          :key="row.id"
          :value="row.id"
        >
          <XhTableCell value="select"><XhTableRowSelectTrigger /></XhTableCell>
          <XhTableCell value="name" :style="{ paddingInlineStart: \`\${row.level * 16}px\` }">
            <XhTableExpandTrigger v-if="row.level === 1" />
            {{ byId.get(row.id)?.label }}
          </XhTableCell>
          <XhTableCell value="owner">{{ byId.get(row.id)?.owner }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>选中：{{ selection === "all" ? "全部" : selection.length ? selection.join("、") : "（无）" }}</span>
  </div>
</template>
`;export{e as default};