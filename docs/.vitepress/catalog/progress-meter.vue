<script setup lang="ts">
import type { ProgressThreshold } from "@xihan-ui/headless";
import { XhProgress } from "@xihan-ui/vue";

const ranges: ProgressThreshold[] = [
  { value: 60, tone: "danger", label: "差" },
  { value: 80, tone: "warning", label: "良" },
  { value: 100, tone: "success", label: "优" },
];
</script>

<template>
  <!-- 图表总览里的引用卡：仪表盘与子弹图归进度条，这里放一张缺省形态的子弹图 -->
  <XhProgress
    semantics="meter"
    :value="72"
    :thresholds="ranges"
    :target="85"
    scale
    aria-label="完成率"
    style="inline-size: var(--xh-doc-catalog-w)"
  />
</template>
