<!-- 禁用 | 禁止调整面板比例 -->
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const panels = [{ id: "aside" }, { id: "main" }];
</script>

<template>
  <XhSplitterRoot
    :panels="panels"
    disabled
    style="inline-size: min(480px, 100%); block-size: 140px"
  >
    <XhSplitterPanel :index="0" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1" style="background: var(--xh-bg-brand-subtle)">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
