<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 按真实卡片的封面与文字节奏占位 -->
<script setup lang="ts">
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhSkeletonRoot style="inline-size: 260px">
    <XhSkeletonItem shape="rect" style="--xh-skeleton-rect-block-size: 120px" />
    <XhSkeletonItem style="inline-size: 60%" />
    <XhSkeletonItem style="inline-size: 80%" />
    <XhSkeletonItem style="inline-size: 40%" />
  </XhSkeletonRoot>
</template>
