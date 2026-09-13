<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 键盘操作 | 让滑块可聚焦 -->
<script setup lang="ts">
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const box = ref<HTMLElement | null>(null);
const cells = Array.from({ length: 24 }, (_, i) => `第 ${i + 1} 列`);
</script>

<template>
  <div style="position: relative; inline-size: 320px">
    <div
      id="scrollbar-focusable-box"
      ref="box"
      style="
        overflow: auto;
        scrollbar-width: none;
        border: 1px solid var(--xh-border-default);
        border-radius: var(--xh-shape-surface);
        padding: 8px;
      "
    >
      <div style="display: flex; gap: 8px; inline-size: max-content">
        <div
          v-for="cell in cells"
          :key="cell"
          style="
            padding: 6px 12px;
            border-radius: var(--xh-shape-control);
            background: var(--xh-bg-subtle);
            white-space: nowrap;
          "
        >
          {{ cell }}
        </div>
      </div>
    </div>

    <XhScrollbarRoot
      :scrollable="box"
      controls="scrollbar-focusable-box"
      orientation="horizontal"
      type="always"
      size="lg"
      focusable
      :translations="{ thumb: '横向滚动条' }"
    >
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>
