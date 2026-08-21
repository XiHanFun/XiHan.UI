const n=`<!-- 基础用法 | 内容已经在手里就直接给字符串，点一下即交给浏览器；文件名连同扩展名都由 file-name 说了算 -->
<script setup lang="ts">
import { XhDownloadTrigger } from "@xihan-ui/vue";

const notes = "曦寒 UI 导出示例：这一行会被写进 notes.txt";
<\/script>

<template>
  <XhDownloadTrigger :data="notes" file-name="notes.txt">
    导出文本
  </XhDownloadTrigger>
</template>
`;export{n as default};
