<!-- 单选筛选 | 列写 filterMode: "single"，列头的筛选菜单换成单选：选一项即收起，换一项就替换，再选一次已选的那一项撤掉这一列的筛选 -->
<script setup lang="ts">
import type { TableColumnDef, TableFilterValue } from "@xihan-ui/headless";
import { XhTableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

interface Ticket {
  id: string;
  title: string;
  priority: string;
}

const priorities = ["紧急", "高", "普通"];

const columns: TableColumnDef<Ticket>[] = [
  { id: "title", label: "工单" },
  { id: "priority", label: "优先级", width: "7rem", filterMode: "single", filterOptions: priorities.map(value => ({ value })) },
];

const tickets: Ticket[] = Array.from({ length: 9 }, (_, i) => ({
  id: `t${i + 1}`,
  title: `工单 ${i + 1}`,
  priority: priorities[(i * 2) % priorities.length]!,
}));

const filterValue = ref<TableFilterValue>({});
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhTableRoot v-model:filter-value="filterValue" :columns="columns" :data="tickets" aria-label="工单" />
    <span data-demo-output>优先级：{{ filterValue.priority?.[0] ?? "不限" }}</span>
  </div>
</template>
