const n=`<!-- K 线 | mark: 'candlestick' 把开高低收画在同一根上，涨跌分色；style="ohlc" 换成美国线 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

// 20 个交易日的开高低收，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
let close = 42;
const days = Array.from({ length: 20 }, (_, i) => {
  const open = close;
  close = Math.round((open + (noise(i) - 0.48) * 4) * 100) / 100;
  const high = Math.round((Math.max(open, close) + noise(i + 40) * 1.2) * 100) / 100;
  const low = Math.round((Math.min(open, close) - noise(i + 80) * 1.2) * 100) / 100;
  return { day: \`9/\${i + 1}\`, open, high, low, close };
});

const series = [{ mark: "candlestick", x: "day", open: "open", high: "high", low: "low", close: "close", name: "收盘价" }] as const;
<\/script>

<template>
  <XhCartesianChartRoot :data="days" :series="series" :y-axis="{ format: { precision: { type: 'fixed', digits: 2 } } }">
    <template #caption>近 20 个交易日</template>
  </XhCartesianChartRoot>
</template>
`;export{n as default};
