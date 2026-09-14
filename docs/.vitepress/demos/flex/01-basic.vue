<!-- 基础用法 | 水平排列内容 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";
</script>

<template>
  <XhFlex align="center" gap="sm">
    <span style="display: grid; inline-size: 40px; block-size: 40px; place-items: center; border-radius: var(--xh-shape-pill); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand); font-weight: 600">林</span>
    <XhFlex orientation="vertical" gap="xs">
      <strong>林晓</strong>
      <span style="color: var(--xh-fg-muted); font-size: 13px">产品设计师</span>
    </XhFlex>
  </XhFlex>
</template>
