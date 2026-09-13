const n=`<!-- 尺寸 | 使用小、中、大三档尺寸 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
<\/script>

<template>
  <XhDownloadTrigger
    v-for="size in sizes"
    :key="size"
    data="XiHan.UI"
    file-name="xihan-ui.txt"
    :size="size"
  >
    <XhIcon :icon="DownloadIcon" /> 下载文件
  </XhDownloadTrigger>
</template>
`;export{n as default};
