<!-- 垂直与折叠 | 垂直调整并折叠面板 -->
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const panels = [
  { id: "top", min: 10 },
  { id: "middle", min: 10, collapsible: true, collapsedSize: 0 },
  { id: "bottom", min: 10 },
];
</script>

<template>
  <XhSplitterRoot
    :panels="panels"
    orientation="vertical"
    style="inline-size: min(480px, 100%); block-size: 240px"
  >
    <XhSplitterPanel :index="0" style="background: var(--xh-bg-subtle)">
      <p style="padding: 12px">预览</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1" style="background: var(--xh-bg-brand-subtle)">
      <p style="padding: 12px">编辑器</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="1" />
    <XhSplitterPanel :index="2" style="background: var(--xh-bg-subtle)">
      <p style="padding: 12px">控制台</p>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
