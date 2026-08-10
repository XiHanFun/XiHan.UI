<!-- 基础用法 | 图标、标题、说明、操作四段按需摆，只有 root 必须写 -->
<script setup lang="ts">
import {
  XhButton,
  XhResultAction,
  XhResultDescription,
  XhResultIcon,
  XhResultRoot,
  XhResultTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhResultRoot status="success">
    <XhResultIcon>✓</XhResultIcon>
    <XhResultTitle>订单已提交</XhResultTitle>
    <XhResultDescription>
      单号 2026-0810-3312，两个工作日内发货，物流单号会发到你的手机上。
    </XhResultDescription>
    <XhResultAction>
      <XhButton tone="brand" variant="solid">查看订单</XhButton>
      <XhButton variant="outline">继续逛逛</XhButton>
    </XhResultAction>
  </XhResultRoot>
</template>
