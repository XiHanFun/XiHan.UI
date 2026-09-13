<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 为滚动容器添加滚动条 -->
<script setup lang="ts">
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const box = ref<HTMLElement | null>(null);
const items = ["项目概览", "组件规范", "设计令牌", "无障碍", "交互状态", "主题配置", "发布记录", "迁移指南"];
</script>

<template>
  <div style="position: relative; inline-size: 240px">
    <div
      ref="box"
      style="
        block-size: 144px;
        overflow: auto;
        scrollbar-width: none;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
        padding: 12px;
      "
    >
      <div v-for="item in items" :key="item" style="padding-block: 6px">
        {{ item }}
      </div>
    </div>

    <XhScrollbarRoot :scrollable="box" type="always">
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>
