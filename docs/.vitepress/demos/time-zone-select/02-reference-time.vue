<!-- 参考时刻 | 用排期当天而不是今天计算 DST 偏移 -->
<script setup lang="ts">
import { XhTimeZoneSelect } from "@xihan-ui/vue";

const zones = ["America/New_York", "Europe/London", "Asia/Shanghai"];
</script>

<template>
  <div data-demo-stack>
    <XhTimeZoneSelect
      default-value="America/New_York"
      :time-zones="zones"
      :reference-time="Date.UTC(2026, 0, 15)"
      :translations="{ label: '冬季排期时区' }"
    />
    <XhTimeZoneSelect
      default-value="America/New_York"
      :time-zones="zones"
      :reference-time="Date.UTC(2026, 6, 15)"
      :translations="{ label: '夏季排期时区' }"
    />
  </div>
</template>
