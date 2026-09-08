const t=`<!-- 涨跌 | trend 落成 trend 部件的 data-direction，箭头由皮肤画；与 tone 正交——跌也可以是好事 -->
<script setup lang="ts">
import {
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticTrend,
  XhStatisticValue,
} from "@xihan-ui/vue";

const cards = [
  { label: "本月新增用户", value: "12,480", unit: "人", trend: "up", tone: "success", note: "同比 12.4%" },
  { label: "订单退货率", value: "1.8", unit: "%", trend: "down", tone: "success", note: "同比 0.6%" },
  { label: "平均响应时长", value: "240", unit: "ms", trend: "flat", tone: "neutral", note: "与上周持平" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px">
    <XhStatisticRoot
      v-for="c in cards"
      :key="c.label"
      :tone="c.tone"
      :trend="c.trend"
    >
      <XhStatisticLabel>{{ c.label }}</XhStatisticLabel>
      <XhStatisticValue>{{ c.value }}</XhStatisticValue>
      <XhStatisticSuffix>{{ c.unit }}</XhStatisticSuffix>
      <XhStatisticTrend>{{ c.note }}</XhStatisticTrend>
    </XhStatisticRoot>
  </div>
</template>
`;export{t as default};
