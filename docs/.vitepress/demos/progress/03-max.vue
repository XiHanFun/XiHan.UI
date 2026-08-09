<!-- 自定义量程 | max 不是 100 时按 value/max 折算，用于「已完成 3/8 步」这类场景 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhProgress :value="3" :max="8" />
    <XhProgress :value="8" :max="8" />
  </div>
</template>
