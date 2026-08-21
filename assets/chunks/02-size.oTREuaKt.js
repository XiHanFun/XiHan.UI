const t=`<!-- 尺寸 | size 只换留白与字号，语义一点不动；不传即 md -->
<script setup lang="ts">
import {
  XhEmptyStateDescription,
  XhEmptyStateIcon,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhEmptyStateRoot size="sm" style="inline-size: 220px">
    <XhEmptyStateIcon>∅</XhEmptyStateIcon>
    <XhEmptyStateTitle>sm</XhEmptyStateTitle>
    <XhEmptyStateDescription>塞进侧栏或卡片里的那一档。</XhEmptyStateDescription>
  </XhEmptyStateRoot>

  <XhEmptyStateRoot style="inline-size: 220px">
    <XhEmptyStateIcon>∅</XhEmptyStateIcon>
    <XhEmptyStateTitle>md</XhEmptyStateTitle>
    <XhEmptyStateDescription>缺省档，列表与表格用它。</XhEmptyStateDescription>
  </XhEmptyStateRoot>

  <XhEmptyStateRoot size="lg" style="inline-size: 220px">
    <XhEmptyStateIcon>∅</XhEmptyStateIcon>
    <XhEmptyStateTitle>lg</XhEmptyStateTitle>
    <XhEmptyStateDescription>整页只有这一块时用它。</XhEmptyStateDescription>
  </XhEmptyStateRoot>
</template>
`;export{t as default};
