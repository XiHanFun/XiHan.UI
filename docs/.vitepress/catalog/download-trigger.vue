<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhDownloadTrigger data="XiHan.UI" file-name="xihan-ui.txt">
    <XhIcon :icon="DownloadIcon" /> 下载文件
  </XhDownloadTrigger>
</template>
