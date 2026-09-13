<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 对齐与分布 | 对齐内容并分配剩余空间 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";
</script>

<template>
  <XhFlex
    align="center"
    justify="between"
    style="inline-size: min(360px, 100%); padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <XhFlex align="center" gap="sm">
      <span style="display: grid; inline-size: 36px; block-size: 36px; place-items: center; border-radius: var(--xh-shape-pill); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand)">周</span>
      <XhFlex orientation="vertical" gap="xs"><strong>周宁</strong><small style="color: var(--xh-fg-muted)">在线</small></XhFlex>
    </XhFlex>
    <span style="color: var(--xh-fg-brand)">项目负责人</span>
  </XhFlex>
</template>
