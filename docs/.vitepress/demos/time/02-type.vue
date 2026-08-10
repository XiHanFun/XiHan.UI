<!-- 呈现方式 | date 只到日、datetime 到秒、relative 说成「几分钟前」；datetime 属性的精度跟着走 -->
<script setup lang="ts">
import { XhTime } from "@xihan-ui/vue";

const value = "2026-08-11T09:30:05";
// 参照时刻写死，示例的产出才不随打开页面的时间变
const now = "2026-08-11T12:00:00";

const types = ["date", "datetime", "relative"] as const;
</script>

<template>
  <div style="display: grid; grid-template-columns: auto auto; gap: 8px 24px; justify-content: start">
    <template v-for="type in types" :key="type">
      <code>{{ type }}</code>
      <XhTime :value="value" :type="type" :now="now" />
    </template>
  </div>
</template>
