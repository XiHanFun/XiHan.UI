const n=`<!-- 禁用 | 禁止触发下载 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/vue";
<\/script>

<template>
  <XhDownloadTrigger disabled data="XiHan.UI" file-name="xihan-ui.txt">
    <XhIcon :icon="DownloadIcon" /> 下载文件
  </XhDownloadTrigger>
</template>
`;export{n as default};
