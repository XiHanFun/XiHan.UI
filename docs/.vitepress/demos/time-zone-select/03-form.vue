<!-- 表单提交 | 保存 IANA 时区名，而不是当前 UTC 偏移 -->
<script setup lang="ts">
import { XhTimeZoneSelect } from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>(null);
const zones = ["UTC", "Asia/Shanghai", "America/New_York"];
</script>

<template>
  <form data-demo-stack @submit.prevent>
    <XhTimeZoneSelect v-model:value="value" name="timeZone" :time-zones="zones" />
    <button type="submit">保存排期</button>
  </form>
</template>
