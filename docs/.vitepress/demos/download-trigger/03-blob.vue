<!-- Blob | 下载 JSON 文件 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/vue";

const data = new Blob([JSON.stringify({ name: "XiHan.UI", version: "1.1.0" }, null, 2)], {
  type: "application/json",
});
</script>

<template>
  <XhDownloadTrigger :data="data" file-name="package.json">
    <XhIcon :icon="DownloadIcon" /> 导出 JSON
  </XhDownloadTrigger>
</template>
