<!-- 触屏拖动把手 | 整行起手只认鼠标与笔；触屏要按住行首那个把手才拖得动，代价是那一小块地方不再跟着表格滚。键盘那一路照旧：Tab 进表体后 Alt + 上下键 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhTableBody,
  XhTableCaption,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowDragTrigger,
} from "@xihan-ui/vue";

const columns = [
  { id: "step", label: "序号", width: "4rem" },
  { id: "name", label: "环节", width: "10rem" },
  { id: "owner", label: "负责人" },
];

const steps = ref([
  { id: "s1", name: "需求评审", owner: "赵一" },
  { id: "s2", name: "方案设计", owner: "钱二" },
  { id: "s3", name: "开发实现", owner: "孙三" },
  { id: "s4", name: "测试验收", owner: "李四" },
  { id: "s5", name: "发布上线", owner: "周五" },
]);

// 行序的主人是这份数组，跟着它走
const rows = computed(() => steps.value.map((s) => ({ id: s.id })));

// details.ids 是已经重排好的整份行序，照它取一遍就是新数组
const onRowMove = (details: { id: string; from: number; to: number; ids: string[] }) => {
  const byId = new Map(steps.value.map((s) => [s.id, s]));
  steps.value = details.ids.flatMap((id) => byId.get(id) ?? []);
};

// 表头没有把手，补一块同宽的空位，列标题才和下面的格子对得上
const spacerStyle = "flex: none; inline-size: var(--xh-table-row-drag-size, var(--xh-control-indicator-size))";
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot :columns="columns" :rows="rows" row-reorderable @row-move="onRowMove">
      <XhTableCaption>
        鼠标按住整行就能拖；手机上按住行首的抓手拖，按下即走，不用先拖一段距离
      </XhTableCaption>
      <XhTableHeader>
        <XhTableRow>
          <span aria-hidden="true" :style="spacerStyle" />
          <XhTableColumnHeader value="step">序号</XhTableColumnHeader>
          <XhTableColumnHeader value="name">环节</XhTableColumnHeader>
          <XhTableColumnHeader value="owner">负责人</XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="(s, i) in steps" :key="s.id" :value="s.id">
          <!-- 把手排在所有格子之前；它对读屏隐藏也不占 Tab 位，键盘换位走表体上的 Alt + 上下键 -->
          <XhTableRowDragTrigger />
          <XhTableCell value="step">{{ i + 1 }}</XhTableCell>
          <XhTableCell value="name">{{ s.name }}</XhTableCell>
          <XhTableCell value="owner">{{ s.owner }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
    </XhTableRoot>
    <span>当前顺序：{{ steps.map((s) => s.name).join(" → ") }}</span>
  </div>
</template>
