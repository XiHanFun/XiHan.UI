<!-- 状态与文案 | 禁用、校验失败和本地化文案沿用字段与 Combobox 契约 -->
<script setup lang="ts">
import { XhTimeZoneSelect } from "@xihan-ui/vue";

const zones = ["UTC", "Asia/Shanghai", "America/New_York"];
const translations = { label: "会议时区", placeholder: "搜索城市或偏移", empty: "没有匹配的时区", trigger: "展开时区", clearTrigger: "清空时区" };
</script>

<template>
  <div data-demo-stack>
    <XhTimeZoneSelect default-value="UTC" :time-zones="zones" disabled :translations="translations" />
    <XhTimeZoneSelect :time-zones="zones" invalid :translations="translations" />
  </div>
</template>
