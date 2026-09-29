const n=`<!-- 按下下钻 | 点一格或焦点在格上按 Enter，报告那一格：据此打开明细 -->
<script setup lang="ts">
import type { HeatmapCellDetails } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const days = ["周一", "周二", "周三"];
const slots = ["上午", "下午", "夜里"];
const orders = [
  { row: "周一", column: "上午", value: 12 },
  { row: "周一", column: "下午", value: 30 },
  { row: "周一", column: "夜里", value: 8 },
  { row: "周二", column: "上午", value: 26 },
  { row: "周二", column: "下午", value: 18 },
  { row: "周二", column: "夜里", value: 4 },
  { row: "周三", column: "上午", value: 6 },
  { row: "周三", column: "下午", value: 34 },
  { row: "周三", column: "夜里", value: 15 },
];

const picked = ref<HeatmapCellDetails | null>(null);
<\/script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); justify-items: start">
    <!-- 载荷与详情同源：行、列、原始值与档位都在里面，不必回头查数据 -->
    <XhHeatmapRoot
      variant="matrix"
      :rows="days"
      :columns="slots"
      :value="orders"
      style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px"
      @cell-press="picked = $event"
    />
    <p aria-live="polite" style="margin: 0">
      {{ picked ? \`\${picked.row} \${picked.column}：\${picked.count} 单\` : "点一格查看明细" }}
    </p>
  </div>
</template>
`;export{n as default};
