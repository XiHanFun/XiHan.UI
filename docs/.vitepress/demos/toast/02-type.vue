<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 语气 | 卡片保持中性，type 只改变标题与状态图标；error 使用 assertive 实时区，loading 不自动消失 -->
<script setup lang="ts">
import {
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";

const items = [
  { type: "info", title: "草稿已保存" },
  { type: "success", title: "发布成功" },
  { type: "warning", title: "配额即将用尽" },
  { type: "error", title: "同步失败，稍后自动重试" },
  { type: "loading", title: "正在上传" },
] as const;
</script>

<template>
  <div style="display: grid; width: 100%; gap: 12px; justify-items: center">
    <XhToastRoot
      v-for="item in items"
      :key="item.type"
      :type="item.type"
      :title="item.title"
      :duration="0"
      :closable="false"
    >
      <XhToastIndicator />
      <XhToastContent><XhToastTitle /></XhToastContent>
    </XhToastRoot>
  </div>
</template>
