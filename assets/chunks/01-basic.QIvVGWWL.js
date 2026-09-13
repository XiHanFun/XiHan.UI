const n=`<!-- 基础用法 | 下载文本文件 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/vue";

const content = "XiHan.UI";
<\/script>

<template>
  <XhDownloadTrigger :data="content" file-name="xihan-ui.txt">
    <XhIcon :icon="DownloadIcon" /> 下载文件
  </XhDownloadTrigger>
</template>
`;export{n as default};
