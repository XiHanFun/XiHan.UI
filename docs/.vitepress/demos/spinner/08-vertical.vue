<!-- 竖排配文 | orientation="vertical" 时转圈在上、配文在下居中，适合整块区域的等待 -->
<script setup lang="ts">
import { XhSpinner, XhSpinnerLabel } from "@xihan-ui/vue";
</script>

<template>
  <XhSpinner orientation="vertical" label="正在加载数据">
    <XhSpinnerLabel />
  </XhSpinner>
</template>
