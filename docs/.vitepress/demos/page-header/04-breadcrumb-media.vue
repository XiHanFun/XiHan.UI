<!-- 导航与媒体 | 补充页面路径和对象标识 -->
<script setup lang="ts">
import {
  XhPageHeaderBreadcrumb,
  XhPageHeaderDescription,
  XhPageHeaderMedia,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPageHeaderRoot variant="outline" style="inline-size: min(720px, 100%)">
    <XhPageHeaderBreadcrumb>工作台 / 客户 / Acme Inc.</XhPageHeaderBreadcrumb>
    <XhPageHeaderMedia>
      <span style="display: grid; place-items: center; inline-size: 40px; block-size: 40px; border-radius: var(--xh-shape-pill); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand); font-weight: 600">A</span>
    </XhPageHeaderMedia>
    <XhPageHeaderTitle>Acme Inc.</XhPageHeaderTitle>
    <XhPageHeaderDescription>企业客户 · 最近联系于昨天</XhPageHeaderDescription>
  </XhPageHeaderRoot>
</template>
