<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

const cover = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Ccircle%20cx=%224%22%20cy=%223%22%20r=%221.4%22%20fill=%22%23fbbf24%22/%3E%3Cpath%20d=%22M0%209%20L5%204.5%20L8%207%20L11%203.5%20L16%209%20Z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";
</script>

<template>
  <XhImageRoot :src="cover" alt="示例封面图" style="--xh-image-w: var(--xh-doc-catalog-w); --xh-image-ratio: 16 / 9">
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>
</template>
