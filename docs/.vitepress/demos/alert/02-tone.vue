<!-- 语气 | tone 只改配色，语义仍由内容与 role 决定 -->
<script setup lang="ts">
import { XhAlertContent, XhAlertRoot, XhAlertTitle } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhAlertRoot tone="success"><XhAlertContent><XhAlertTitle>保存成功</XhAlertTitle></XhAlertContent></XhAlertRoot>
    <XhAlertRoot tone="warning"><XhAlertContent><XhAlertTitle>配额即将用尽</XhAlertTitle></XhAlertContent></XhAlertRoot>
    <XhAlertRoot tone="danger"><XhAlertContent><XhAlertTitle>发布失败</XhAlertTitle></XhAlertContent></XhAlertRoot>
  </div>
</template>
