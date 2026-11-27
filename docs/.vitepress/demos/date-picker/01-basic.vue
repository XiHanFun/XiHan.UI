<!-- 基础用法 | 只写根组件就按标准结构铺出标题、逐段输入的日期盒与日历浮层 -->
<script setup lang="ts">
import { XhDatePickerRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhDatePickerRoot label="交付日期" locale="zh-CN" name="delivery-date" />
</template>
