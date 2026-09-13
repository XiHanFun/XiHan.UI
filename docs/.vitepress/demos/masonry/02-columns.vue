<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 响应式列 | 根据容器宽度调整列数 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const items = ["概览", "组件", "主题", "发布"];
</script>

<template>
  <XhMasonry :columns="{ base: 1, sm: 2, md: 3 }" gap="sm" style="inline-size: min(720px, 100%)">
    <div
      v-for="(item, index) in items"
      :key="item"
      :style="`padding: ${16 + index * 6}px 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)`"
    >
      {{ item }}
    </div>
  </XhMasonry>
</template>
