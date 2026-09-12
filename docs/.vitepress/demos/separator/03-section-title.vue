<!-- 分组标题 | 在分隔线中显示标题 -->
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 20px; inline-size: min(480px, 100%)">
    <XhSeparator decorative>基本信息</XhSeparator>
    <XhSeparator decorative align="start">联系方式</XhSeparator>
    <XhSeparator decorative align="end">其他信息</XhSeparator>
  </div>
</template>
