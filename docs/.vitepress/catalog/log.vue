<script setup lang="ts">
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const lines = [
  "12:00:01  boot  读取配置",
  "12:00:01  boot  监听 :8080",
  "12:00:02  db    连接池就绪",
  "12:00:03  http  GET /health 200",
  "12:00:04  http  POST /api/orders 201",
];
</script>

<template>
  <XhLogRoot :rows="5" style="inline-size: 240px; font-size: 11px">
    <XhLogViewport>
      <XhLogContent>
        <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
      </XhLogContent>
    </XhLogViewport>
  </XhLogRoot>
</template>
