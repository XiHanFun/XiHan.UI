<script setup lang="ts">
import { XhGraphChartRoot } from "@xihan-ui/vue";

const nodes = [
  { id: "a", group: "甲" },
  { id: "b", group: "甲" },
  { id: "c", group: "甲" },
  { id: "d", group: "乙" },
  { id: "e", group: "乙" },
  { id: "f", group: "乙" },
  { id: "g", group: "丙" },
];
const links = [
  { source: "a", target: "b" },
  { source: "a", target: "c" },
  { source: "b", target: "c" },
  { source: "c", target: "d" },
  { source: "d", target: "e" },
  { source: "d", target: "f" },
  { source: "e", target: "f" },
  { source: "f", target: "g" },
];
</script>

<template>
  <!-- 卡片只有一块可用高：视口高度取卡片下发的那个值，不带标题；名字是单字母，放不下的自己让位 -->
  <XhGraphChartRoot
    :nodes="nodes"
    :links="links"
    aria-label="关系图"
    style="inline-size: var(--xh-doc-catalog-w); --xh-graph-chart-height: var(--xh-doc-catalog-h)"
  />
</template>
