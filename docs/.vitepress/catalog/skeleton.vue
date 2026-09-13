<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 skeleton 相关实现。 -->

<script setup lang="ts">
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhSkeletonRoot style="inline-size: 220px">
    <XhSkeletonItem shape="rect" style="--xh-skeleton-rect-block-size: 72px" />
    <XhSkeletonItem style="inline-size: 70%" />
    <XhSkeletonItem style="inline-size: 45%" />
  </XhSkeletonRoot>
</template>
