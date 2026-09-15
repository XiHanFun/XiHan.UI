const n=`<!-- 基础用法 | root / viewport / content / line 四层；一行写什么由作者定，组件只给身份与等宽排版 -->
<script setup lang="ts">
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/vue";

const lines = [
  "12:00:01  boot     读取配置 config/app.yaml",
  "12:00:01  boot     监听 0.0.0.0:8080",
  "12:00:02  db       连接池就绪，最小 4 最大 32",
  "12:00:02  cache    命中率统计已开启",
  "12:00:03  http     GET  /health            200   3ms",
  "12:00:04  http     POST /api/orders        201  118ms",
  "12:00:05  http     GET  /api/orders/8812   200   21ms",
  "12:00:06  job      对账任务排入队列 batch-2026-08-10",
  "12:00:07  http     GET  /api/orders/8813   404    9ms",
  "12:00:08  job      对账任务完成，处理 1,204 笔",
];
<\/script>

<template>
  <XhLogRoot :rows="8" style="inline-size: 100%">
    <XhLogViewport>
      <XhLogContent>
        <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
      </XhLogContent>
    </XhLogViewport>
  </XhLogRoot>
</template>
`;export{n as default};
