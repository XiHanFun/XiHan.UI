const n=`<!-- 加载态 | pending 表示正在取数：首次还没有数据时空态写「加载中」并转圈，之后重取时保留上一帧、整体变淡，取回来再过渡到新值 -->
<script setup lang="ts">
import { XhButton, XhCartesianChartRoot } from "@xihan-ui/vue";
import { ref } from "vue";

// 两批数据轮流取回，模拟每次刷新拿到的新结果
const batches = [
  [
    { month: "一月", amount: 1204 },
    { month: "二月", amount: 986 },
    { month: "三月", amount: 1530 },
    { month: "四月", amount: 1382 },
    { month: "五月", amount: 1745 },
    { month: "六月", amount: 1618 },
  ],
  [
    { month: "一月", amount: 1310 },
    { month: "二月", amount: 1120 },
    { month: "三月", amount: 1480 },
    { month: "四月", amount: 1600 },
    { month: "五月", amount: 1705 },
    { month: "六月", amount: 1890 },
  ],
];

const data = ref<{ month: string; amount: number }[]>([]);
const pending = ref(false);
let turn = 0;

function load(): void {
  pending.value = true;
  setTimeout(() => {
    data.value = batches[turn++ % batches.length]!;
    pending.value = false;
  }, 1000);
}

load();
<\/script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); justify-items: start; width: 100%">
    <XhButton variant="subtle" :disabled="pending" @click="load">刷新</XhButton>
    <XhCartesianChartRoot
      :data="data"
      :series="[{ mark: 'bar', x: 'month', y: 'amount', name: '销售额' }]"
      :pending="pending"
      style="width: 100%"
    >
      <template #caption>月度销售额</template>
    </XhCartesianChartRoot>
  </div>
</template>
`;export{n as default};
