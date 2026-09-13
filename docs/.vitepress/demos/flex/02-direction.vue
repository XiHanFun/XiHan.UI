<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 方向 | 设置水平或垂直排列 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const items = ["设计", "开发", "测试"];
const itemStyle = "padding: 8px 14px; border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle)";
</script>

<template>
  <XhFlex orientation="vertical" gap="lg">
    <XhFlex gap="sm">
      <span v-for="item in items" :key="item" :style="itemStyle">{{ item }}</span>
    </XhFlex>
    <XhFlex orientation="vertical" gap="sm" style="inline-size: 120px">
      <span v-for="item in items" :key="item" :style="itemStyle">{{ item }}</span>
    </XhFlex>
  </XhFlex>
</template>
