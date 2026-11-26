<!-- props 写法 | 不写结构时按标准结构铺：标签、数值与涨跌几项写出一块统计数，单位放进 suffix 插槽；数值按当前语言分组 -->
<script setup lang="ts">
import { XhStatisticRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhStatisticRoot label="本月新增用户" :value="12480" trend="up" trend-text="同比 12.4%">
    <template #suffix>人</template>
  </XhStatisticRoot>
</template>
