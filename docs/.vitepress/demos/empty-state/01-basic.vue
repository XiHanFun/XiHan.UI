<!-- 基础用法 | 图标、标题、说明、操作四个槽都可选，只有 root 是必须的 -->
<script setup lang="ts">
import {
  XhButton,
  XhEmptyStateAction,
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhEmptyStateRoot style="inline-size: 100%">
    <!-- 图标是装饰性的，内容由作者塞：字形、内联 svg 都行 -->
    <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
    <XhEmptyStateTitle>还没有任何工单</XhEmptyStateTitle>
    <XhEmptyStateDescription>
      新建一条工单，或者换个筛选条件再看看。
    </XhEmptyStateDescription>
    <XhEmptyStateAction>
      <XhButton variant="solid">新建工单</XhButton>
      <XhButton variant="ghost">清空筛选</XhButton>
    </XhEmptyStateAction>
  </XhEmptyStateRoot>
</template>
