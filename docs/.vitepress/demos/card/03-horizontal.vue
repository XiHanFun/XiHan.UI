<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 横向布局 | Card 只提供内容面，方向和媒体尺寸由使用场景决定 -->
<script setup lang="ts">
import {
  XhCardContent,
  XhCardDescription,
  XhCardFooter,
  XhCardHeader,
  XhCardRoot,
  XhCardTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhCardRoot style="inline-size: 100%; max-inline-size: 520px; flex-direction: row; align-items: center">
    <div
      aria-hidden="true"
      style="flex: none; inline-size: 120px; aspect-ratio: 1; border-radius: var(--xh-shape-surface); background: linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-subtle))"
    />
    <XhCardContent>
      <XhCardHeader>
        <XhCardTitle>七月总结</XhCardTitle>
        <XhCardDescription>收入与支出趋势已生成</XhCardDescription>
      </XhCardHeader>
      <XhCardFooter>更新于今天 09:30</XhCardFooter>
    </XhCardContent>
  </XhCardRoot>
</template>
