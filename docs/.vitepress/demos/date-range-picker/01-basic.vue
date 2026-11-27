<!-- 基础用法 | 只写根组件就按标准结构铺出标题、起止两组日期段与日历浮层 -->
<script setup lang="ts">
import { XhDateRangePickerRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhDateRangePickerRoot label="行程日期" locale="zh-CN" name="trip-start" end-name="trip-end" />
</template>
