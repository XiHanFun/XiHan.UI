<!-- 空态与加载态 | 两个状态节点常挂着只靠 hidden 显隐：表体为空且在取数时露加载态，取数完了没有行才露空态 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableEmptyState,
  XhTableHeader,
  XhTableLoadingState,
  XhTableRoot,
  XhTableRow,
} from "@xihan-ui/vue";

interface Task {
  id: string;
  name: string;
  owner: string;
}

const columns = [
  { id: "name", label: "任务", width: "10rem" },
  { id: "owner", label: "负责人" },
];

const source: Task[] = [
  { id: "t1", name: "构建流水线", owner: "赵一" },
  { id: "t2", name: "组件回归", owner: "钱二" },
  { id: "t3", name: "文档校订", owner: "孙三" },
];

const tasks = ref<Task[]>([]);
const loading = ref(false);
let timer = 0;

function load(): void {
  window.clearTimeout(timer);
  tasks.value = [];
  loading.value = true;
  timer = window.setTimeout(() => {
    tasks.value = source;
    loading.value = false;
  }, 1200);
}

function reset(): void {
  window.clearTimeout(timer);
  tasks.value = [];
  loading.value = false;
}

// 表体为空与否按 rows 推导，不必另写 empty
const rows = computed(() => tasks.value.map((t) => ({ id: t.id })));
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <div style="display: flex; gap: 8px">
      <button type="button" @click="load">取数</button>
      <button type="button" @click="reset">清空</button>
    </div>

    <XhTableRoot :columns="columns" :rows="rows" :loading="loading">
      <XhTableHeader>
        <XhTableRow>
          <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
            {{ col.label }}
          </XhTableColumnHeader>
        </XhTableRow>
      </XhTableHeader>
      <XhTableBody>
        <XhTableRow v-for="t in tasks" :key="t.id" :value="t.id">
          <XhTableCell value="name">{{ t.name }}</XhTableCell>
          <XhTableCell value="owner">{{ t.owner }}</XhTableCell>
        </XhTableRow>
      </XhTableBody>
      <XhTableLoadingState>正在取数…</XhTableLoadingState>
      <XhTableEmptyState>还没有任务，点「取数」拉一份。</XhTableEmptyState>
    </XhTableRoot>
  </div>
</template>
