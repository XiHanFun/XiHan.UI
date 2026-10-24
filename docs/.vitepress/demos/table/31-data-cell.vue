<!-- 格子插槽 | 数据驱动下要在格子里放标签、链接这类内容时接管那一格：参数里有记录、字段值与本来要显示的文字，别的列照常交出文字 -->
<script setup lang="ts">
import type { TableColumnDef, TableRecord } from "@xihan-ui/headless";
import { XhTableRoot, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const statusMeta = {
  todo: { label: "待办", tone: "neutral" as const },
  doing: { label: "进行中", tone: "brand" as const },
  done: { label: "已完成", tone: "success" as const },
};

type Status = keyof typeof statusMeta;

// 筛选项的 label 是给人看的字，value 与字段值比
const columns: TableColumnDef[] = [
  { id: "name", label: "任务", sortable: true },
  { id: "owner", label: "负责人", width: "7rem" },
  {
    id: "status",
    label: "状态",
    width: "8rem",
    filterOptions: Object.entries(statusMeta).map(([value, meta]) => ({ value, label: meta.label })),
  },
];

const tasks = [
  { id: "t1", name: "接入单点登录", owner: "赵一", status: "doing" },
  { id: "t2", name: "导出报表", owner: "钱二", status: "todo" },
  { id: "t3", name: "表格虚拟滚动", owner: "孙三", status: "done" },
  { id: "t4", name: "暗色主题", owner: "李四", status: "doing" },
];

const statusOf = (record: TableRecord | undefined): (typeof statusMeta)[Status] => statusMeta[(record?.status as Status | undefined) ?? "todo"];
</script>

<template>
  <div style="width: 100%; max-width: 560px">
    <XhTableRoot :columns="columns" :data="tasks" aria-label="任务">
      <!-- 状态那一列放一枚标签，语气跟着状态走；别的列交出本来要显示的文字 -->
      <template #cell="{ column, record, text }">
        <XhTagRoot v-if="column.id === 'status'" :tone="statusOf(record).tone" size="sm">
          <XhTagLabel>{{ statusOf(record).label }}</XhTagLabel>
        </XhTagRoot>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </XhTableRoot>
  </div>
</template>
