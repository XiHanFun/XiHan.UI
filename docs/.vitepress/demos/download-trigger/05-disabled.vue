<!-- 禁用 | 禁用的触发器不可聚焦也点不动，连取数函数都不会被调用 -->
<script setup lang="ts">
import { XhDownloadTrigger } from "@xihan-ui/vue";

const notes = "曦寒 UI 导出示例：这一行会被写进 notes.txt";
</script>

<template>
  <XhDownloadTrigger disabled :data="notes" file-name="notes.txt">
    导出文本（暂不可用）
  </XhDownloadTrigger>
</template>
