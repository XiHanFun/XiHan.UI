<!-- 形态与语气 | variant 切换同一组数的画法：line 折线、area 折线下铺一层淡洗、bar 柱；颜色本身带好坏含义时写 tone，线与标记点整条取语气色，缺省 neutral 线取弱化色、末点取品牌色 -->
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

const orders = [18, 24, 21, 30, 27, 35, 32, 41];
const variants = ["line", "area", "bar"] as const;

// 近 10 分钟的错误率（%）：越高越糟，取危险色
const errors = [0.4, 0.5, 0.3, 0.6, 0.9, 1.4, 1.2, 1.8, 2.3, 2.1];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
    <div :style="{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--xh-space-6)' }">
      <XhSparkline
        v-for="v in variants"
        :key="v"
        :data="orders"
        :variant="v"
        :aria-label="`近 8 天订单数（${v}）`"
      />
    </div>

    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-6)">
      <XhSparkline :data="errors" tone="danger" aria-label="近 10 分钟错误率" />
    </div>
  </div>
</template>
