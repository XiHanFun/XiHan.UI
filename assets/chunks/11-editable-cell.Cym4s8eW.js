var e=`<!-- 单元格就地编辑 | 表体的方向键与 Home/End 是挂在 body 上的冒泡监听，可编辑控件上阻止冒泡后这些键就回归输入框自身 -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldInput,
  XhNumberFieldRoot,
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const columns = [
  { id: "item", label: "条目", width: "9rem" },
  { id: "count", label: "数量", width: "6rem" },
  { id: "note", label: "备注" },
];

// 数量是数字框的原始串，合计时再读成数
const lines = ref([
  { id: "l1", item: "键盘", count: "2", note: "机械轴" },
  { id: "l2", item: "鼠标", count: "3", note: "无线" },
  { id: "l3", item: "显示器支架", count: "1", note: "" },
]);

// 行序不随编辑变化，rows 取一次即可
const rows = lines.value.map(line => ({ id: line.id }));

// Escape 把焦点交还所在行，表体的方向键随即恢复
function onEditKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape")
    return;
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
            <XhTableColumnLabel>{{ col.label }}</XhTableColumnLabel>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="line in lines" :key="line.id" :value="line.id">
          <XhTableCell value="item">{{ line.item }}</XhTableCell>
          <XhTableCell value="count">
            <XhNumberFieldRoot v-model:value="line.count" :min="0" size="sm">
              <XhNumberFieldControl>
                <!-- keydown 掐断冒泡：不然上下键与 Home/End 会被表体收走去搬焦点行 -->
                <XhNumberFieldInput :aria-label="\`\${line.item} 数量\`" @keydown.stop="onEditKeydown" />
              </XhNumberFieldControl>
            </XhNumberFieldRoot>
          </XhTableCell>
          <XhTableCell value="note">
            <XhTextFieldRoot v-model:value="line.note" placeholder="可以打空格" size="sm">
              <XhTextFieldControl>
                <XhTextFieldInput :aria-label="\`\${line.item} 备注\`" @keydown.stop="onEditKeydown" />
              </XhTextFieldControl>
            </XhTextFieldRoot>
          </XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span data-demo-output>
      合计 {{ lines.reduce((sum, line) => sum + (Number(line.count) || 0), 0) }} 件
    </span>
  </div>
</template>
`;export{e as default};