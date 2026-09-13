const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 外观 | 设置角度、间距、字号和透明度 -->
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";

const looks = [
  { label: "默认", rotate: undefined, gap: undefined, fontSize: undefined, opacity: undefined },
  { label: "紧凑", rotate: 0, gap: 8, fontSize: 12, opacity: 0.18 },
  { label: "宽松", rotate: -45, gap: 56, fontSize: 18, opacity: 0.12 },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhWatermarkRoot
      v-for="l in looks"
      :key="l.label"
      text="曦寒"
      :rotate="l.rotate"
      :gap="l.gap"
      :font-size="l.fontSize"
      :opacity="l.opacity"
      style="inline-size: 220px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhWatermarkContent>
        <div style="padding: 16px; block-size: 160px; font-size: 13px">{{ l.label }}</div>
      </XhWatermarkContent>
    </XhWatermarkRoot>
  </div>
</template>
`;export{n as default};
