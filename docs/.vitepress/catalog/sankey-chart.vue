<script setup lang="ts">
import { XhSankeyChartRoot } from "@xihan-ui/vue";

const links = [
  { source: "搜索", target: "首页", value: 32 },
  { source: "广告", target: "首页", value: 15 },
  { source: "广告", target: "详情", value: 9 },
  { source: "首页", target: "详情", value: 26 },
  { source: "首页", target: "离开", value: 21 },
  { source: "详情", target: "下单", value: 17 },
  { source: "详情", target: "离开", value: 18 },
];
</script>

<template>
  <!-- 卡片只有一块可用高：视口高度取卡片下发的那个值，不带标题；没有分组，图例自己收起 -->
  <XhSankeyChartRoot
    :links="links"
    aria-label="访客流向"
    style="inline-size: var(--xh-doc-catalog-w); --xh-sankey-chart-height: var(--xh-doc-catalog-h)"
  />
</template>
