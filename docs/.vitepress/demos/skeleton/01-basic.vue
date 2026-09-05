<!-- 基础用法 | 容器竖着码放骨架条，形状缺省是一行文字 -->
<script setup lang="ts">
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhSkeletonRoot style="inline-size: 260px">
    <XhSkeletonItem />
    <XhSkeletonItem />
    <XhSkeletonItem />
  </XhSkeletonRoot>
</template>
