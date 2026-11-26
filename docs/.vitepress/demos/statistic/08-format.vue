<!-- 格式化 | formatOptions 原样交给 Intl.NumberFormat：货币、百分比与紧凑记数都按当前语言的写法输出 -->
<script setup lang="ts">
import { XhStatisticRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px">
    <XhStatisticRoot label="本月营收" :value="1284500.5" :format-options="{ style: 'currency', currency: 'CNY' }" />
    <XhStatisticRoot label="转化率" :value="0.0384" :format-options="{ style: 'percent', minimumFractionDigits: 1 }" />
    <XhStatisticRoot label="累计访问" :value="3218000" :format-options="{ notation: 'compact' }" />
  </div>
</template>
