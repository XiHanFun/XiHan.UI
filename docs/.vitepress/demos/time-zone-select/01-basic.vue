<!-- 基础用法 | 按地区、城市或 UTC 偏移检索 IANA 时区 -->
<script setup lang="ts">
import { XhTimeZoneSelect } from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>("Asia/Shanghai");
const zones = [
  "UTC",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
];
</script>

<template>
  <XhTimeZoneSelect v-model:value="value" :time-zones="zones" />
  <p>当前值：{{ value ?? "未选择" }}</p>
</template>
