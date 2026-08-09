<!-- 禁用 | disabled 后拖不动也推不动，分隔条整个退出 Tab 序列，方向键放行给页面 -->
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
    style="inline-size: 100%; block-size: 120px"
  >
    <XhSplitterPanel :index="0">
      <p style="padding: 12px">侧栏</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1">
      <p style="padding: 12px">正文</p>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
