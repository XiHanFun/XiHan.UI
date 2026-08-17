<!-- 滚动加载 | 浮层的滚动容器就是 content：@scroll 直接落在它身上，滚到底就把下一页并进选项 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

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
  const el = event.target as HTMLElement;
  if (loading.value || tickets.value.length >= TOTAL) return;
  if (el.scrollTop + el.clientHeight < el.scrollHeight - 8) return;
  loading.value = true;
  window.setTimeout(() => {
    tickets.value = [...tickets.value, ...makePage(tickets.value.length)];
    loading.value = false;
  }, 500);
}
</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="请选择">
    <XhSelectLabel>工单</XhSelectLabel>
    <XhSelectTrigger>
      <XhSelectValueText />
      <XhSelectIndicator>▾</XhSelectIndicator>
    </XhSelectTrigger>
    <XhSelectPositioner>
      <XhSelectContent @scroll="onScroll">
        <XhSelectList>
          <XhSelectItem v-for="t in tickets" :key="t.value" :value="t.value">
            <XhSelectItemText>{{ t.label }}</XhSelectItemText>
            <XhSelectItemIndicator>✓</XhSelectItemIndicator>
          </XhSelectItem>
          <XhSelectItem v-if="loading" value="loading" disabled>
            <XhSelectItemText>加载中…</XhSelectItemText>
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p>已加载 {{ tickets.length }} / {{ TOTAL }} 条</p>
</template>
