<!-- 嵌套分栏 | 组合水平和垂直面板 -->
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const outer = [
  { id: "aside", min: 15, max: 50 },
  { id: "workbench", min: 30 },
];
const inner = [
  { id: "editor", min: 20 },
  { id: "console", min: 15 },
];
</script>

<template>
  <XhSplitterRoot :panels="outer" style="inline-size: min(640px, 100%); block-size: 240px">
    <XhSplitterPanel :index="0" style="background: var(--xh-bg-subtle)">
      <p style="padding: 12px">文件</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1">
      <XhSplitterRoot
        :panels="inner"
        orientation="vertical"
        style="inline-size: 100%; block-size: 100%"
      >
        <XhSplitterPanel :index="0" style="background: var(--xh-bg-brand-subtle)">
          <p style="padding: 12px">编辑器</p>
        </XhSplitterPanel>
        <XhSplitterResizeTrigger :index="0" />
        <XhSplitterPanel :index="1" style="background: var(--xh-bg-subtle)">
          <p style="padding: 12px">控制台</p>
        </XhSplitterPanel>
      </XhSplitterRoot>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
