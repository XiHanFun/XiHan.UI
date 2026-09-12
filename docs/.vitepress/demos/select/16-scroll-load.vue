<!-- 滚动加载 | 到达列表底部加载下一页 -->
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectLoading,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
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

// 距底不足 8px 视为触底，取下一页
function onScroll(event: Event): void {
  const el = event.currentTarget as HTMLElement;
  if (loading.value || tickets.value.length >= TOTAL)
    return;
  if (el.scrollTop + el.clientHeight < el.scrollHeight - 8)
    return;
  loading.value = true;
  window.setTimeout(() => {
    tickets.value = [...tickets.value, ...makePage(tickets.value.length)];
    loading.value = false;
  }, 500);
}
</script>

<template>
  <XhSelectRoot v-model:value="picked" :loading="loading" placeholder="请选择">
    <XhSelectLabel>工单</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList @scroll="onScroll">
          <XhSelectItem v-for="t in tickets" :key="t.value" :value="t.value">
            <XhSelectItemText>{{ t.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
        <XhSelectLoading>加载中…</XhSelectLoading>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p>已加载 {{ tickets.length }} / {{ TOTAL }} 条</p>
</template>
