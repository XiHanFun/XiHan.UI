<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 按最短列排列卡片 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cards = [
  { title: "快速上手", description: "几分钟完成安装并渲染第一个组件。" },
  { title: "无头内核", description: "行为、状态和无障碍逻辑独立于视图层，可在多个框架中复用。" },
  { title: "设计令牌", description: "统一颜色、间距和动效。" },
  { title: "多端适配", description: "同时支持 Vue、React 和 Web Components。" },
  { title: "无障碍", description: "内置键盘导航与语义属性。" },
  { title: "主题系统", description: "支持浅色、深色、高对比度和自定义品牌主题。" },
];
</script>

<template>
  <XhMasonry :columns="3" gap="md" style="inline-size: min(680px, 100%)">
    <article
      v-for="card in cards"
      :key="card.title"
      style="padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <strong>{{ card.title }}</strong>
      <p style="margin-block-end: 0; color: var(--xh-fg-muted)">{{ card.description }}</p>
    </article>
  </XhMasonry>
</template>
