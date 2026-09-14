<!-- 基础用法 | Header 放标题与说明，Content 放主体 -->
<script setup lang="ts">
import { XhCardContent, XhCardDescription, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhCardRoot style="inline-size: 360px; max-inline-size: 100%">
    <XhCardHeader>
      <XhCardTitle>本月账单</XhCardTitle>
      <XhCardDescription>账期 7 月 1 日至 7 月 31 日</XhCardDescription>
    </XhCardHeader>
    <XhCardContent>共 128 笔支出，合计 3,240.00 元。</XhCardContent>
  </XhCardRoot>
</template>
