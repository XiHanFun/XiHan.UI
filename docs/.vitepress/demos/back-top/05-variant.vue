<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 变体 | 选择与所在表面匹配的样式 -->
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";

const variants = [
  { label: "默认", value: undefined },
  { label: "实心", value: "solid" },
  { label: "线框", value: "outline" },
  { label: "幽灵", value: "ghost" },
] as const;
</script>

<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)); gap: 12px; inline-size: min(640px, 100%)">
    <div
      v-for="item in variants"
      :key="item.label"
      style="position: relative; block-size: 120px; padding: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <span style="color: var(--xh-fg-muted)">{{ item.label }}</span>
      <XhBackTopRoot
        :variant="item.value"
        :visibility-height="0"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  </div>
</template>
