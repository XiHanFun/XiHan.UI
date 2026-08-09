<!-- 基础用法 | panels 数组的长度决定面板块数，每条分隔条调的是它前面那一块 -->
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

// id 用来派生面板的 DOM id，分隔条的 aria-controls 指向它
const panels = [
  { id: "aside", min: 20, max: 60 },
  { id: "main", min: 25 },
];
</script>

<template>
  <!-- 分栏必须先有一个确定的跨轴尺寸，才谈得上把它分成几份 -->
  <XhSplitterRoot :panels="panels" style="inline-size: 100%; block-size: 140px">
    <XhSplitterPanel :index="0">
      <p style="padding: 12px">侧栏：min 20% / max 60%，拖到底也留得住 20%。</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1">
      <p style="padding: 12px">正文：min 25%，侧栏再撑也吃不掉它这一份。</p>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
