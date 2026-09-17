<script setup lang="ts">
import {
  XhHoverCardContent,
  XhHoverCardDescription,
  XhHoverCardRoot,
  XhHoverCardTitle,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 展示已打开的静态卡片：不包 Positioner，content 就地渲染，宽度由预览根约束 -->
  <div style="display: grid; gap: var(--xh-space-2); inline-size: var(--xh-doc-catalog-w)">
    <div>
      最近这批组件由
      <XhHoverCardRoot placement="bottom-start" default-open>
        <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
        <XhHoverCardContent style="inline-size: var(--xh-doc-catalog-w)">
          <XhHoverCardTitle>XiHan.UI</XhHoverCardTitle>
          <XhHoverCardDescription>框架无关的设计系统运行时，Vue 与 Web Components 共用同一套无头内核。</XhHoverCardDescription>
        </XhHoverCardContent>
      </XhHoverCardRoot>
      推上来。
    </div>
  </div>
</template>
