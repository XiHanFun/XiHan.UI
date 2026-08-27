<!-- 横排与网格 | orientation 三档：竖排、横排，换行网格用 both，落点按最近中心判 -->
<script setup lang="ts">
import { XhSortableItem, XhSortableItemHandle, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const tabs = ref(["概览", "订单", "库存", "报表"]);
const cards = ref(["甲", "乙", "丙", "丁", "戊", "己"]);
</script>

<template>
  <p style="margin-bottom: 8px">横排：只认左右方向键。</p>
  <XhSortableRoot v-model:ids="tabs" orientation="horizontal">
    <XhSortableItem v-for="id in tabs" :key="id" :item-id="id" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemHandle :item-id="id">⠿</XhSortableItemHandle>
      <span>{{ id }}</span>
    </XhSortableItem>
  </XhSortableRoot>

  <p style="margin: 20px 0 8px">换行网格：上下左右都认，落点取离指针最近的那一格。</p>
  <XhSortableRoot v-model:ids="cards" orientation="both" style="max-inline-size: 320px">
    <XhSortableItem v-for="id in cards" :key="id" :item-id="id" style="display: flex; align-items: center; justify-content: center; inline-size: 88px; block-size: 64px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemHandle :item-id="id">{{ id }}</XhSortableItemHandle>
    </XhSortableItem>
  </XhSortableRoot>
</template>
