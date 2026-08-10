<!-- 拖拽调列宽 | 列宽的事实源是 columns[].width，把手只是列标题里的一段标记：按下量起点，移动改宽度，连接层随即写进列标题与整列单元格 -->
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

// 列宽写成数字即按 px 处理
const columns = ref([
  { id: "name", label: "姓名", width: 120 },
  { id: "dept", label: "部门", width: 150 },
  { id: "city", label: "城市", width: 120 },
]);

const members = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京" },
  { id: "u4", name: "李四", dept: "质量保障", city: "成都" },
];

const rows = members.map((m) => ({ id: m.id }));

const MIN_WIDTH = 72;

let grabbed: { id: string; startX: number; startWidth: number } | null = null;

function onGrab(event: PointerEvent, id: string): void {
  const col = columns.value.find((c) => c.id === id);
  if (!col) return;
  grabbed = { id, startX: event.clientX, startWidth: col.width };
  // 捕获指针：手滑出把手后的 move / up 仍送到这里
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  event.preventDefault();
}

function onDrag(event: PointerEvent): void {
  if (!grabbed) return;
  const col = columns.value.find((c) => c.id === grabbed!.id);
  if (!col) return;
  col.width = Math.max(MIN_WIDTH, grabbed.startWidth + event.clientX - grabbed.startX);
}

function onRelease(): void {
  grabbed = null;
}

const handleStyle = {
  flex: "none",
  alignSelf: "stretch",
  inlineSize: "6px",
  cursor: "col-resize",
  background: "var(--xh-border-default)",
  touchAction: "none",
};
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot :columns="columns" :rows="rows">
      <XhTableCaption>拖动列标题右侧那条竖线</XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis">
              {{ col.label }}
            </span>
            <!-- 把手与排序把手是兄弟节点，拖它不会连带触发排序 -->
            <span
              aria-hidden="true"
              :style="handleStyle"
              @pointerdown="onGrab($event, col.id)"
              @pointermove="onDrag"
              @pointerup="onRelease"
              @pointercancel="onRelease"
            />
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
    <span>列宽：{{ columns.map((c) => `${c.label} ${c.width}px`).join(" · ") }}</span>
  </div>
</template>
