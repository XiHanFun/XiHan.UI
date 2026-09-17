<script setup lang="ts">
import {
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 展示已打开的静态面板：不包 Positioner，content 就地渲染，宽度由预览根约束 -->
  <div style="display: grid; gap: var(--xh-space-2); justify-items: start; inline-size: var(--xh-doc-catalog-w)">
    <XhPopoverRoot placement="bottom-start" default-open :close-on-interact-outside="false" :translations="{ close: '关闭' }">
      <XhPopoverTrigger>订阅设置</XhPopoverTrigger>
      <XhPopoverContent>
        <XhPopoverTitle>订阅设置</XhPopoverTitle>
        <XhPopoverDescription>每周一汇总发送，随时可以退订。</XhPopoverDescription>
        <XhPopoverCloseTrigger />
      </XhPopoverContent>
    </XhPopoverRoot>
  </div>
</template>
