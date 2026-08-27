<!-- 拖拽换列位 | 列上标了 reorderable 才认拖拽把手；也可以 Tab 到它用方向键挪，Home / End 到两头 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnDragTrigger,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

// 标了 reorderable 的列才产出把手。没标的列是屏障：拖不过去，也落不到它身上
const columns = [
  { id: "name", label: "姓名", width: 120, reorderable: true },
  { id: "dept", label: "部门", width: 150, reorderable: true },
  { id: "city", label: "城市", width: 120, reorderable: true },
  { id: "ops", label: "操作", width: 100 },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
];

const rows = members.map((m) => ({ id: m.id }));

// 换位落在列偏好的 order 里，可以直接存起来下次还原
const preference = ref<Record<string, unknown>>({});

// 列序由偏好决定，渲染顺序读 api.columns；这里照它取每行的格子
const cell = (m: (typeof members)[number], id: string): string =>
  ({ name: m.name, dept: m.dept, city: m.city, ops: "编辑" })[id] ?? "";
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      v-slot="{ columns: effective }"
      v-model:column-preference="preference"
      :columns="columns"
      :rows="rows"
    >
      <XhTableCaption>拖列标题左侧的抓手换位；「操作」列没标 reorderable，拖不动也拖不过去</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in effective" :key="col.id" :value="col.id">
            <!-- 把手在标题之前；不可拖的列它自己报不可用 -->
            <XhTableColumnDragTrigger />
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">
              {{ col.label }}
            </span>
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
          <XhTableCell v-for="col in effective" :key="col.id" :value="col.id" :row="m.id">
            {{ cell(m, col.id) }}
          </XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>列序：{{ (preference.order as string[] | undefined)?.join(" → ") ?? "（还没改过）" }}</span>
  </div>
</template>
