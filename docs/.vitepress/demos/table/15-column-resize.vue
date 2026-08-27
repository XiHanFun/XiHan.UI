<!-- 拖拽调列宽 | 列上标了 resizable 才认改宽把手；拖出表头仍跟手，方向键一次 8px、按住 Shift 一次 40px -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnResizeTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

// 列宽写成数字即按 px 处理；minWidth / maxWidth 是拖动的上下限
const columns = [
  { id: "name", label: "姓名", width: 120, resizable: true, minWidth: 72 },
  { id: "dept", label: "部门", width: 150, resizable: true, minWidth: 90, maxWidth: 260 },
  { id: "city", label: "城市", width: 120 },
];

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
  { id: "u4", name: "李四", dept: "质量保障", city: "成都" },
];

const rows = members.map((m) => ({ id: m.id }));

// 改宽落在列偏好里，可以直接存起来下次还原
const preference = ref<Record<string, unknown>>({});
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      v-model:column-preference="preference"
      :columns="columns"
      :rows="rows"
    >
      <XhTableCaption>拖动列标题右侧那条竖线；也可以 Tab 到它用方向键调</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">
              {{ col.label }}
            </span>
            <!-- 把手压在两列的接缝上；没标 resizable 的列它自己不显示 -->
            <XhTableColumnResizeTrigger />
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
          <XhTableCell value="name">{{ m.name }}</XhTableCell>
          <XhTableCell value="dept">{{ m.dept }}</XhTableCell>
          <XhTableCell value="city">{{ m.city }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>列宽偏好：{{ JSON.stringify(preference.widths ?? {}) }}</span>
  </div>
</template>
