const e=`<!-- 范围选 | 按住 Shift 点勾选框选中一段；焦点落在表体里按 Ctrl/Cmd + A 全选。禁用行占着顺序位置但不被选进去 -->
<script setup lang="ts">
import { ref } from "vue";
import {
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
  { id: "select", width: "3rem" },
  { id: "name", label: "文件名", width: "10rem" },
  { id: "size", label: "大小" },
];

const files = [
  { id: "f1", name: "报告.docx", size: "1.2 MB" },
  { id: "f2", name: "预算.xlsx", size: "480 KB" },
  { id: "f3", name: "会议纪要.md", size: "12 KB" },
  { id: "f4", name: "归档.zip（禁用）", size: "88 MB" },
  { id: "f5", name: "封面.png", size: "2.4 MB" },
  { id: "f6", name: "演示.pptx", size: "5.1 MB" },
];

// 禁用行选不动，也不算进全选的基数
const rows = files.map((f) => ({ id: f.id, ...(f.id === "f4" ? { disabled: true } : {}) }));

const selection = ref<string[] | "all">([]);
<\/script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <p style="color: var(--xh-fg-muted)">
      点第一行的勾选框，再<strong>按住 Shift</strong> 点第五行 —— 中间整段一起选上（禁用那行跳过）。
      再按住 Shift 点第三行，选区会往回收，起点不变。
      焦点落在表体里按 <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>A</kbd> 全选。
    </p>
    <XhTableRoot
      v-model:selection="selection"
      :columns="columns"
      :rows="rows"
      selection-mode="multiple"
    >
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader value="select">
            <XhTableSelectAllTrigger />
          </XhTableColumnHeader>
          <XhTableColumnHeader value="name">文件名</XhTableColumnHeader>
          <XhTableColumnHeader value="size">大小</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="f in files" :key="f.id" :value="f.id">
          <XhTableCell value="select">
            <XhTableRowSelectTrigger />
          </XhTableCell>
          <XhTableCell value="name">{{ f.name }}</XhTableCell>
          <XhTableCell value="size">{{ f.size }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>
      选中：{{
        selection === "all"
          ? "全部"
          : selection.length
            ? selection.join("、")
            : "（无）"
      }}
    </span>
  </div>
</template>
`;export{e as default};
