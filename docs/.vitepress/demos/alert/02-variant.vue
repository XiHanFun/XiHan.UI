<!-- 变体 | variant 只改配色，语义仍由内容与 role 决定 -->
<script setup lang="ts">
import { XhAlertRoot, XhAlertTitle } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhAlertRoot variant="success"><XhAlertTitle>保存成功</XhAlertTitle></XhAlertRoot>
    <XhAlertRoot variant="warning"><XhAlertTitle>配额即将用尽</XhAlertTitle></XhAlertRoot>
    <XhAlertRoot variant="danger"><XhAlertTitle>发布失败</XhAlertTitle></XhAlertRoot>
  </div>
</template>
