<script setup lang="ts">
import { XhHierarchyChartRoot } from "@xihan-ui/vue";

const budget = {
  name: "预算",
  children: [
    { name: "研发", children: [{ name: "平台", value: 42 }, { name: "移动", value: 26 }, { name: "数据", value: 18 }] },
    { name: "市场", children: [{ name: "品牌", value: 21 }, { name: "渠道", value: 16 }] },
    { name: "销售", children: [{ name: "华东", value: 24 }, { name: "华南", value: 18 }, { name: "华北", value: 15 }] },
  ],
};
</script>

<template>
  <!-- 卡片只有一块可用高：视口高度取卡片下发的那个值，不带标题，只画一层 -->
  <XhHierarchyChartRoot
    :data="budget"
    :depth="1"
    aria-label="预算"
    style="inline-size: var(--xh-doc-catalog-w); --xh-hierarchy-chart-height: var(--xh-doc-catalog-h)"
  />
</template>
