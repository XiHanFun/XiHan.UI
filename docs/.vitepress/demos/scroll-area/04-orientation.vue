<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 横向滚动 | 只启用横向滚动 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const cards = ["概览", "分析", "报告", "成员", "设置", "发布"];
</script>

<template>
  <XhScrollAreaRoot
    orientation="horizontal"
    type="always"
    style="block-size: 110px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface)"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="display: flex; gap: 10px; padding: 10px 12px">
        <div
          v-for="card in cards"
          :key="card"
          style="
            flex: none;
            display: grid;
            place-items: center;
            inline-size: 96px;
            block-size: 64px;
            border-radius: var(--xh-shape-surface);
            background: var(--xh-bg-subtle);
          "
        >
          {{ card }}
        </div>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="horizontal">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
