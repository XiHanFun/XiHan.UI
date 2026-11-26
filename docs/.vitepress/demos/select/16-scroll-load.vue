<!-- 滚动加载 | 列表滚到底派发 load-more，宿主取下一页接到 collection 末尾 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";
import { ref } from "vue";

interface Ticket {
  value: string;
  label: string;
}

const PAGE_SIZE = 20;
const TOTAL = 80;

function makePage(from: number): Ticket[] {
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    value: `no-${from + i + 1}`,
    label: `第 ${from + i + 1} 号工单`,
  }));
}

const tickets = ref<Ticket[]>(makePage(0));
const loading = ref(false);
const picked = ref<string[]>([]);

// 在途时不会再派发；取完了就不再取
function loadMore(): void {
  if (tickets.value.length >= TOTAL)
    return;
  loading.value = true;
  window.setTimeout(() => {
    tickets.value = [...tickets.value, ...makePage(tickets.value.length)];
    loading.value = false;
  }, 500);
}
</script>

<template>
  <XhSelectRoot
    v-model:value="picked"
    :collection="tickets"
    :loading="loading"
    label="工单"
    placeholder="请选择"
    @load-more="loadMore"
  />
  <p data-demo-output>已加载 {{ tickets.length }} / {{ TOTAL }} 条</p>
</template>
