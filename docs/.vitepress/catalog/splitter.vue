<script setup lang="ts">
import { XhSplitterPanel, XhSplitterResizeTrigger, XhSplitterRoot } from "@xihan-ui/vue";

const panels = [
  { id: "aside", min: 20, max: 60 },
  { id: "main", min: 25 },
];
</script>

<template>
  <XhSplitterRoot :panels="panels" style="inline-size: 240px; block-size: 140px">
    <XhSplitterPanel :index="0" style="padding: 12px; background: var(--xh-bg-subtle)">文件</XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1" style="padding: 12px; background: var(--xh-bg-brand-subtle)">编辑器</XhSplitterPanel>
  </XhSplitterRoot>
</template>
