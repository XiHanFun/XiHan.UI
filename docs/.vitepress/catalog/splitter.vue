<script setup lang="ts">
import { XhSplitterPanel, XhSplitterResizeTrigger, XhSplitterRoot } from "@xihan-ui/vue";

const panels = [
  { id: "aside", min: 20, max: 60 },
  { id: "main", min: 25 },
];
</script>

<template>
  <XhSplitterRoot :panels="panels" aria-label="双栏分隔预览" style="inline-size: var(--xh-doc-catalog-w); block-size: var(--xh-doc-catalog-h)">
    <XhSplitterPanel
      :index="0"
      data-demo-block
      data-tone="neutral"
      aria-label="侧栏区块"
      style="--xh-demo-block-block-size: 100%; --xh-demo-block-radius: 0"
    />
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel
      :index="1"
      data-demo-block
      data-tone="brand"
      aria-label="主内容区块"
      style="--xh-demo-block-block-size: 100%; --xh-demo-block-radius: 0"
    />
  </XhSplitterRoot>
</template>
