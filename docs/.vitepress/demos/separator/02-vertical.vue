<!-- 垂直分隔线 | 分隔行内内容 -->
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; block-size: 24px">
    <span>概览</span><XhSeparator orientation="vertical" decorative /><span>分析</span><XhSeparator orientation="vertical" decorative /><span>报告</span>
  </div>
</template>
