<script setup lang="ts">
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 展示已打开的静态气泡：不包 Positioner，content 就地渲染，宽度由预览根约束 -->
  <div style="display: grid; gap: var(--xh-space-2); justify-items: start; inline-size: var(--xh-doc-catalog-w)">
    <XhPopconfirmRoot default-open :close-on-interact-outside="false">
      <XhPopconfirmTrigger>删除这条记录</XhPopconfirmTrigger>
      <XhPopconfirmContent>
        <XhPopconfirmTitle>删除后不可恢复</XhPopconfirmTitle>
        <XhPopconfirmDescription>这条记录连同它的附件一起清掉。</XhPopconfirmDescription>
        <XhPopconfirmCancelTrigger>取消</XhPopconfirmCancelTrigger>
        <XhPopconfirmConfirmTrigger>删除</XhPopconfirmConfirmTrigger>
      </XhPopconfirmContent>
    </XhPopconfirmRoot>
  </div>
</template>
