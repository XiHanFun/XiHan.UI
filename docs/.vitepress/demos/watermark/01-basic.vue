<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 为内容添加文字水印 -->
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhWatermarkRoot text="XiHan · 内部资料">
    <XhWatermarkContent>
      <div style="inline-size: 320px; padding: 24px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>季度报告</strong>
        <p style="margin-block-end: 0">本季度活跃用户增长 18.6%，核心功能使用率持续提升。</p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
