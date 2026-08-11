<!-- 一万条只渲可视区 | 面板插槽给的是本侧此刻看得见的全集，作者按滚动位置切一段挂出来，上下各留一个撑高块；全选、计数与搬运不读 DOM，照样管到窗口外 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";

// 行高与列表高度写死，窗口才算得出来
const ROW = 30;
const VIEW = 240;
const OVERSCAN = 6;

const listStyle =
  "--xh-transfer-list-min-h: 240px; --xh-transfer-list-max-h: 240px";

interface PanelItem {
  value: string;
  label: string;
}

const items: PanelItem[] = Array.from({ length: 10000 }, (_, i) => ({
  value: `sku-${i + 1}`,
  label: `商品 SKU-${String(i + 1).padStart(5, "0")}`,
}));

// 两侧各记一份滚动位置
const scrolled = ref<Record<string, number>>({ source: 0, target: 0 });

function onScroll(side: string, event: Event) {
  scrolled.value = {
    ...scrolled.value,
    [side]: (event.target as HTMLElement).scrollTop,
  };
}

// 该挂出来的那一段：可视区前后各多铺几条，方向键走到边上时下一条已经在 DOM 里
function range(side: string, list: PanelItem[]) {
  const max = Math.max(0, list.length * ROW - VIEW);
  const top = Math.min(scrolled.value[side] ?? 0, max);
  const start = Math.max(0, Math.floor(top / ROW) - OVERSCAN);
  const end = Math.min(list.length, Math.ceil((top + VIEW) / ROW) + OVERSCAN);
  return { start, end };
}

function rowsOf(side: string, list: PanelItem[]): PanelItem[] {
  const { start, end } = range(side, list);
  return list.slice(start, end);
}

function padStartOf(side: string, list: PanelItem[]): number {
  return range(side, list).start * ROW;
}

function padEndOf(side: string, list: PanelItem[]): number {
  return (list.length - range(side, list).end) * ROW;
}

const value = ref<string[]>(["sku-3"]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 560px">
    <XhTransferRoot v-model:value="value" :collection="items" searchable>
      <XhTransferSourcePanel v-slot="{ items: shown }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>全部商品</XhTransferPanelTitle>
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索编号" />
        <XhTransferList :style="listStyle" @scroll="onScroll('source', $event)">
          <div
            aria-hidden="true"
            :style="{ flex: 'none', blockSize: `${padStartOf('source', shown)}px` }"
          />
          <XhTransferItem
            v-for="item in rowsOf('source', shown)"
            :key="item.value"
            :value="item.value"
            :style="{ blockSize: `${ROW}px` }"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
          <div
            aria-hidden="true"
            :style="{ flex: 'none', blockSize: `${padEndOf('source', shown)}px` }"
          />
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger>›</XhTransferToTargetTrigger>
      <XhTransferToSourceTrigger>‹</XhTransferToSourceTrigger>

      <XhTransferTargetPanel v-slot="{ items: shown }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>本次上架</XhTransferPanelTitle>
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索编号" />
        <XhTransferList :style="listStyle" @scroll="onScroll('target', $event)">
          <div
            aria-hidden="true"
            :style="{ flex: 'none', blockSize: `${padStartOf('target', shown)}px` }"
          />
          <XhTransferItem
            v-for="item in rowsOf('target', shown)"
            :key="item.value"
            :value="item.value"
            :style="{ blockSize: `${ROW}px` }"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
          <div
            aria-hidden="true"
            :style="{ flex: 'none', blockSize: `${padEndOf('target', shown)}px` }"
          />
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>

    <p style="margin-block-start: 12px; font-size: 13px">
      已上架 {{ value.length }} 件
    </p>
  </div>
</template>
