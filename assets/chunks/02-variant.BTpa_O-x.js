var e=`<!-- 形态 | variant 切换同一组数的画法：line 折线、area 折线下铺一层淡洗、bar 柱 -->
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

const orders = [18, 24, 21, 30, 27, 35, 32, 41];
const variants = ["line", "area", "bar"] as const;
<\/script>

<template>
  <div :style="{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--xh-space-6)' }">
    <XhSparkline
      v-for="v in variants"
      :key="v"
      :data="orders"
      :variant="v"
      :aria-label="\`近 8 天订单数（\${v}）\`"
    />
  </div>
</template>
`;export{e as default};