<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

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
      <p style="padding: 12px">侧栏</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1" style="background: var(--xh-bg-brand-subtle)">
      <p style="padding: 12px">正文</p>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
