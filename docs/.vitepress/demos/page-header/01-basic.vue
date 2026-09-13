<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 显示标题、说明与页面操作 -->
<script setup lang="ts">
import { ArrowLeftIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhPageHeaderBackTrigger,
  XhPageHeaderDescription,
  XhPageHeaderExtra,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPageHeaderRoot variant="surface" style="inline-size: min(720px, 100%)">
    <XhPageHeaderBackTrigger
      type="button"
      aria-label="返回订单列表"
      style="inline-size: 36px; block-size: 36px; border: 0; border-radius: var(--xh-shape-control); background: transparent; color: inherit; font: inherit; cursor: pointer"
    >
      <XhIcon :icon="ArrowLeftIcon" />
    </XhPageHeaderBackTrigger>
    <XhPageHeaderTitle>订单 SO-20260731-004</XhPageHeaderTitle>
    <XhPageHeaderDescription>由赵一创建 · 今天 14:32 更新</XhPageHeaderDescription>
    <XhPageHeaderExtra>
      <XhButton variant="subtle">归档</XhButton>
      <XhButton>编辑订单</XhButton>
    </XhPageHeaderExtra>
  </XhPageHeaderRoot>
</template>
