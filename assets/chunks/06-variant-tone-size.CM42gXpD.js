const n=`<!-- 形态、语气与尺寸 | 三轴只改按钮外观，取数与落盘那条链一个字都不动 -->
<script setup lang="ts">
import { XhDownloadTrigger } from "@xihan-ui/vue";

const notes = "曦寒 UI 导出示例：这一行会被写进 notes.txt";
<\/script>

<template>
  <XhDownloadTrigger :data="notes" file-name="notes.txt" variant="solid">实心</XhDownloadTrigger>
  <XhDownloadTrigger :data="notes" file-name="notes.txt" variant="outline">描边</XhDownloadTrigger>
  <XhDownloadTrigger :data="notes" file-name="notes.txt" variant="ghost">幽灵</XhDownloadTrigger>

  <XhDownloadTrigger :data="notes" file-name="notes.txt" tone="neutral">中性</XhDownloadTrigger>
  <XhDownloadTrigger :data="notes" file-name="notes.txt" tone="success">成功</XhDownloadTrigger>

  <XhDownloadTrigger :data="notes" file-name="notes.txt" size="sm">小</XhDownloadTrigger>
  <XhDownloadTrigger :data="notes" file-name="notes.txt" size="lg">大</XhDownloadTrigger>
</template>
`;export{n as default};
