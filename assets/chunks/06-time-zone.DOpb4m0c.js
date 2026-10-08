var e=`<!-- 时区 | time-zone 给了 IANA 时区名就按那个时区的墙钟显示，datetime 带上该时区的偏移量；不带偏移量的 value 串也按这个时区解读 -->
<script setup lang="ts">
import { XhTimestamp } from "@xihan-ui/vue";

// 同一个时刻：带 Z 的串是确切时刻，与时区无关
const launch = "2026-08-11T01:30:00Z";

const zones = [
  { label: "上海", timeZone: "Asia/Shanghai" },
  { label: "伦敦", timeZone: "Europe/London" },
  { label: "纽约", timeZone: "America/New_York" },
];
<\/script>

<template>
  <div style="display: grid; grid-template-columns: auto auto; gap: 8px 24px; justify-content: start">
    <template v-for="zone in zones" :key="zone.timeZone">
      <span>{{ zone.label }}</span>
      <XhTimestamp :value="launch" :time-zone="zone.timeZone" locale="zh-CN" />
    </template>
  </div>
</template>
`;export{e as default};