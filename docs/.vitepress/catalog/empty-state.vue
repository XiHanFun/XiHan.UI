<script setup lang="ts">
import { XhButton, XhEmptyStateAction, XhEmptyStateIndicator, XhEmptyStateRoot, XhEmptyStateTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhEmptyStateRoot live="off" style="inline-size: var(--xh-doc-catalog-w)">
    <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
    <XhEmptyStateTitle>还没有任何工单</XhEmptyStateTitle>
    <XhEmptyStateAction>
      <XhButton>新建工单</XhButton>
    </XhEmptyStateAction>
  </XhEmptyStateRoot>
</template>
