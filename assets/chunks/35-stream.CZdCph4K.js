const n=`<!-- 实时行情流 | 列式数据仓 append 新成交，同一帧里的多次推送合成一次重画；窗口跟着最新价走，拖离末端即暂停，受控的 follow 一键回到最新 -->
<script setup lang="ts">
import { createColumnStore, XhButton, XhCartesianChartRoot } from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

// 最多留两万笔成交，更早的从头部挤掉；价格是确定的随机游走，每次打开都长一样
const trades = createColumnStore({ fields: ["t", "price"], capacity: 20000 });
let seed = 7;
let price = 62000;
let time = Date.UTC(2026, 8, 1);
function trade(): void {
  seed = (seed * 16807) % 2147483647;
  price += (seed / 2147483647 - 0.5) * 40;
  time += 500;
  trades.append({ t: time, price });
}
for (let i = 0; i < 5000; i++)
  trade();

// 每 100 ms 到五笔：图表按帧合并，不是每笔重画一次；挂上之后才开始推
let timer = 0;
onMounted(() => {
  timer = window.setInterval(() => {
    for (let i = 0; i < 5; i++)
      trade();
  }, 100);
});
onBeforeUnmount(() => window.clearInterval(timer));

// 初始窗口是最近十分钟；拖动、滚轮或键盘让窗口离开末端时 follow 变 false
const follow = ref(true);
const recent = { x: [new Date(time - 10 * 60_000), new Date(time)], y: null };
const series = [{ mark: "line", x: "t", y: "price", name: "BTC/USDT" }] as const;
const annotations = [{ kind: "point", series: "price", at: "last" }] as const;
<\/script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); justify-items: start; width: 100%">
    <XhButton variant="subtle" :disabled="follow" @click="follow = true">回到最新</XhButton>
    <XhCartesianChartRoot
      v-model:follow="follow"
      :data="trades"
      :series="series"
      :x-axis="{ scale: 'time' }"
      :y-axis="{ fit: 'window' }"
      :annotations="annotations"
      :default-window="recent"
      zoom="x"
      style="width: 100%"
    >
      <template #caption>BTC/USDT 逐笔成交</template>
    </XhCartesianChartRoot>
  </div>
</template>
`;export{n as default};
