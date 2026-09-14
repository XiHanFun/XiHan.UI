<!-- 异步内容 | 点击后获取下载内容 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/vue";

async function createCsv() {
  await new Promise(resolve => setTimeout(resolve, 600));
  return "订单号,金额\nA-1001,128.00\nA-1002,96.50";
}
</script>

<template>
  <XhDownloadTrigger :data="createCsv" file-name="orders.csv" mime-type="text/csv">
    <XhIcon :icon="DownloadIcon" /> 导出订单
  </XhDownloadTrigger>
</template>
