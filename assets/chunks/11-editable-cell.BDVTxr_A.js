const n=`<!-- 单元格就地编辑 | 表体的方向键与 Home/End 是挂在 body 上的冒泡监听，可编辑控件上掐断冒泡这些键就回归输入框自己 -->
<script setup lang="ts">
import { ref } from "vue";
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
  { id: "item", label: "条目", width: "9rem" },
  { id: "count", label: "数量", width: "6rem" },
  { id: "note", label: "备注" },
];

const lines = ref([
  { id: "l1", item: "键盘", count: 2, note: "机械轴" },
  { id: "l2", item: "鼠标", count: 3, note: "无线" },
  { id: "l3", item: "显示器支架", count: 1, note: "" },
]);

// 行序不随编辑变化，rows 取一次即可
const rows = lines.value.map((line) => ({ id: line.id }));

// Escape 把焦点交还所在行，表体的方向键随即恢复
function onEditKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;
  const input = event.currentTarget as HTMLElement;
  input.closest<HTMLElement>("[data-part='row']")?.focus();
}
<\/script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot :columns="columns" :rows="rows">
      <XhTableCaption>采购清单</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="line in lines" :key="line.id" :value="line.id">
          <XhTableCell value="item">{{ line.item }}</XhTableCell>
          <XhTableCell value="count">
            <!-- keydown 掐断冒泡：不然上下键与 Home/End 会被表体收走去搬焦点行 -->
            <input
              v-model.number="line.count"
              type="number"
              min="0"
              :aria-label="\`\${line.item} 数量\`"
              style="inline-size: 100%; min-inline-size: 0"
              @keydown.stop="onEditKeydown"
            />
          </XhTableCell>
          <XhTableCell value="note">
            <input
              v-model="line.note"
              type="text"
              placeholder="可以打空格"
              :aria-label="\`\${line.item} 备注\`"
              style="inline-size: 100%; min-inline-size: 0"
              @keydown.stop="onEditKeydown"
            />
          </XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>
      合计 {{ lines.reduce((sum, line) => sum + (line.count || 0), 0) }} 件
    </span>
  </div>
</template>
`;export{n as default};
