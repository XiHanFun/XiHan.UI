<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 双轴滚动 | 同时显示横向和纵向滚动条 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaCorner,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const rows = Array.from({ length: 10 }, (_, index) => `ORD-${String(index + 1).padStart(4, "0")} · 华东区域 · 企业版年度订阅 · 已完成`);
</script>

<template>
  <XhScrollAreaRoot
    type="always"
    style="block-size: 160px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 12px 16px">
        <p
          v-for="row in rows"
          :key="row"
          style="margin: 0; line-height: 28px; white-space: nowrap"
        >
          {{ row }}
        </p>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
      <XhScrollAreaCorner />
    </XhScrollAreaScrollbar>
    <XhScrollAreaScrollbar orientation="horizontal">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
