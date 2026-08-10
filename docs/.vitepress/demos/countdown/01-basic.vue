<!-- 基础用法 | 给一个剩余毫秒就开始往下走，缺省模板是 HH:mm:ss；走到 0 就停住不再往下 -->
<script setup lang="ts">
import { XhCountdown } from "@xihan-ui/vue";

const oneHour = 3600 * 1000;
const twoMinutes = 120 * 1000;
</script>

<template>
  <p>距离结束：<XhCountdown :value="oneHour" /></p>
  <p>本次答题剩余：<XhCountdown :value="twoMinutes" /></p>
</template>
