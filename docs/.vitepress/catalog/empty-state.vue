<script setup lang="ts">
import { XhButton, XhEmptyStateAction, XhEmptyStateDescription, XhEmptyStateIndicator, XhEmptyStateRoot, XhEmptyStateTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhEmptyStateRoot size="sm" live="off" style="inline-size: 230px">
    <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
    <XhEmptyStateTitle>还没有任何工单</XhEmptyStateTitle>
    <XhEmptyStateDescription>新建一条，或换个筛选条件。</XhEmptyStateDescription>
    <XhEmptyStateAction>
      <XhButton size="sm">新建工单</XhButton>
    </XhEmptyStateAction>
  </XhEmptyStateRoot>
</template>
