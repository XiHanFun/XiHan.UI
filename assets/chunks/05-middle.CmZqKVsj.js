const n=`<!-- 中间省略 | position="middle" 把单行文字的省略号收在中间，文件名的开头与扩展名都看得见 -->
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";

const files = [
  "2026-第三季度-经营分析报告-终稿-已审阅.pdf",
  "design-system-tokens-export-dark-theme-v2.json",
  "IMG_20260928_081530_HDR_panorama_edited.jpg",
];
<\/script>

<template>
  <div style="display: grid; gap: 8px; inline-size: 240px; max-inline-size: 100%">
    <XhTruncate v-for="file in files" :key="file" position="middle" tooltip>{{ file }}</XhTruncate>
  </div>
</template>
`;export{n as default};
