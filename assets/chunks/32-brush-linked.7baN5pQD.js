const e=`<!-- 刷选联动 | onBrushSelectionChange 交出框里的数据：旁边的统计跟着框走，清掉框就回到全部门店 -->
<script setup lang="ts">
import type { CartesianBrushSelectionChangeDetails } from "@xihan-ui/headless";
import { XhCartesianChartRoot } from "@xihan-ui/vue";
import { ref } from "vue";

// 60 家门店的面积（m²）与月销售额（万元），由序号算出，每次打开都长一样
const stores = Array.from({ length: 60 }, (_, i) => {
  const area = Math.round(40 + (Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1) * 160);
  const sales = Math.round((area * 0.9 + ((Math.abs(Math.sin(i * 78.233) * 12345.678) % 1) - 0.5) * 60) * 10) / 10;
  return { area, sales };
});

const series = [{ mark: "scatter", x: "area", y: "sales", name: "门店" }] as const;

// 一组门店的家数与平均月销售额
function statsOf(rows: readonly { sales: number }[]): string {
  const average = rows.reduce((sum, row) => sum + row.sales, 0) / Math.max(1, rows.length);
  return \`\${rows.length} 家门店，平均月销售额 \${average.toFixed(1)} 万元\`;
}

// 框里的门店；没有框时是全部
const picked = ref<readonly { area: number; sales: number }[] | null>(null);

function pick(details: CartesianBrushSelectionChangeDetails): void {
  picked.value = details.selection ? details.data.map(item => item.datum as { area: number; sales: number }) : null;
}
<\/script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); width: 100%">
    <XhCartesianChartRoot
      :data="stores"
      :series="series"
      brush="xy"
      @brush-selection-change="pick"
    >
      <template #caption>门店面积与月销售额（拖动框选）</template>
    </XhCartesianChartRoot>
    <p aria-live="polite" style="margin: 0">
      {{ picked ? \`框选了 \${statsOf(picked)}\` : \`全部 \${statsOf(stores)}\` }}
    </p>
  </div>
</template>
`;export{e as default};
