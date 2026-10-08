var e=`<!-- 盈亏 | variant="win-loss" 只看正负：正值在中线之上、负值在中线之下，柱等高，0 不画 -->
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

// 近 16 个交易日的盈亏（元）：只关心赚还是亏、连续几天
const pnl = [120, -40, 85, 60, -15, -80, 0, 45, 30, 90, -25, 70, 55, -60, 20, 110];
<\/script>

<template>
  <XhSparkline :data="pnl" variant="win-loss" aria-label="近 16 个交易日盈亏" />
</template>
`;export{e as default};