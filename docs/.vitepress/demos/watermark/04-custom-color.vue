<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 自定义颜色 | 设置水印前景色 -->
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhWatermarkRoot text="机密" style="--xh-watermark-fg: var(--xh-fg-danger)">
    <XhWatermarkContent>
      <div style="inline-size: 320px; padding: 32px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>财务摘要</strong>
        <p style="margin-block-end: 0">仅限授权成员查看。</p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
