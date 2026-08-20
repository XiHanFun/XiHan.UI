<!-- 失败要说出来 | 取数抛出或拒绝都会退回 idle 并派 download-error，按钮不会一直停在"下载中" -->
<script setup lang="ts">
import type { DownloadTriggerErrorDetails } from "@xihan-ui/headless";
import { ref } from "vue";
import { XhDownloadTrigger } from "@xihan-ui/vue";

const message = ref("还没试过");

function failingData(): Promise<string> {
  return Promise.reject(new Error("导出接口没响应"));
}

function onError(details: DownloadTriggerErrorDetails) {
  message.value = `下载失败：${(details.error as Error).message}`;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 10px">
    <XhDownloadTrigger
      :data="failingData"
      file-name="report.csv"
      @download-error="onError"
    >
      导出报表（必失败）
    </XhDownloadTrigger>
    <span style="font-size: 13px">{{ message }}</span>
  </div>
</template>
