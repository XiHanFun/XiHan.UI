<script setup lang="ts">
import { XhTimeZoneSelect } from "@xihan-ui/vue";

const zones = ["UTC", "Asia/Shanghai", "America/New_York"];
</script>

<template>
  <XhTimeZoneSelect default-value="Asia/Shanghai" :time-zones="zones" />
</template>
