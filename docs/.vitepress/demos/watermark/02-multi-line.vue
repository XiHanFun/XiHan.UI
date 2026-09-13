<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 多行水印 | 显示归属和时间信息 -->
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";

const lines = ["曦寒前端组件库", "zhaifanhua@gmail.com", "2026-08-11"];
</script>

<template>
  <XhWatermarkRoot :text="lines" :font-size="13">
    <XhWatermarkContent>
      <div style="inline-size: 320px; padding: 32px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>设计稿预览</strong>
        <p style="margin-block-end: 0">该内容仅供项目成员评审。</p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
