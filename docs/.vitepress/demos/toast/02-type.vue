<!-- 语气 | type 落成 data-type，皮肤据此换色条；error 走 alert + assertive，loading 表示事情还没完、不自动消失 -->
<script setup lang="ts">
import { XhToastRoot, XhToastTitle } from "@xihan-ui/vue";

const items = [
  { type: "info", title: "草稿已保存" },
  { type: "success", title: "发布成功" },
  { type: "warning", title: "配额即将用尽" },
  { type: "error", title: "同步失败，稍后自动重试" },
  { type: "loading", title: "正在上传" },
] as const;
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhToastRoot
      v-for="item in items"
      :key="item.type"
      :type="item.type"
      :title="item.title"
      :duration="0"
      :closable="false"
    >
      <XhToastTitle />
    </XhToastRoot>
  </div>
</template>
