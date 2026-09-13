<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

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
  <XhSplitterRoot :panels="panels" style="inline-size: min(640px, 100%); block-size: 180px">
    <XhSplitterPanel :index="0" style="padding: 16px; background: var(--xh-bg-subtle)">文件</XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1" style="padding: 16px; background: var(--xh-bg-brand-subtle)">编辑器</XhSplitterPanel>
  </XhSplitterRoot>
</template>
