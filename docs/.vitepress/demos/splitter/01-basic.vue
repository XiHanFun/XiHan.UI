<!-- 基础用法 | 调整侧栏和编辑区域的比例 -->
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const panels = [
  { id: "aside", min: 20, max: 60 },
  { id: "main", min: 25 },
];
</script>

<template>
  <XhSplitterRoot :panels="panels" aria-label="可调整比例的占位区块" style="inline-size: min(640px, 100%); block-size: 180px">
    <XhSplitterPanel :index="0" style="padding: 16px">
      <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%" />
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1" style="padding: 16px">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%" />
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
