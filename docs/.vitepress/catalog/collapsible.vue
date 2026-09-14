<script setup lang="ts">
import { XhCollapsibleContent, XhCollapsibleIndicator, XhCollapsibleRoot, XhCollapsibleTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhCollapsibleRoot default-open style="inline-size: 230px; font-size: 13px">
    <XhCollapsibleTrigger>
      展开详情
      <XhCollapsibleIndicator />
    </XhCollapsibleTrigger>
    <XhCollapsibleContent>收起时内容只加 hidden，节点不卸载。</XhCollapsibleContent>
  </XhCollapsibleRoot>
</template>
