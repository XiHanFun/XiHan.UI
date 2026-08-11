<!-- 分隔条里放内容 | 分隔条的默认插槽收作者写的把手，粗细由 --xh-splitter-trigger-thickness 让出位置 -->
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const panels = [
  { id: "list", min: 25, max: 75 },
  { id: "detail", min: 25 },
];
const defaultSize = [40, 60];

// 把手不参与命中判定，指针与键盘照旧落在分隔条自己身上
const gripStyle = {
  fontSize: "12px",
  lineHeight: "1",
  color: "var(--xh-fg-muted)",
};
</script>

<template>
  <XhSplitterRoot
    :panels="panels"
    :default-sizes="defaultSize"
    style="inline-size: 100%; block-size: 140px"
  >
    <XhSplitterPanel :index="0">
      <p style="padding: 12px">列表</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger
      :index="0"
      style="--xh-splitter-trigger-thickness: 14px"
    >
      <span aria-hidden="true" :style="gripStyle">⋮⋮</span>
    </XhSplitterResizeTrigger>
    <XhSplitterPanel :index="1">
      <p style="padding: 12px">详情</p>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
