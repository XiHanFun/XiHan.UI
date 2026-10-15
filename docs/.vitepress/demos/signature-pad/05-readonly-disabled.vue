<!-- 只读与禁用 | 只读时已绘制的笔迹可见但不可修改，禁用时连清空按钮都不可按下；两者都使用原生 disabled，不只是视觉置灰 -->
<script setup lang="ts">
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadLabel,
  XhSignaturePadPath,
  XhSignaturePadRoot,
} from "@xihan-ui/vue";

// 钮上的字要包含在读屏名里：名字取 translations，给一句以可见字开头的中文
const translations = { clearTrigger: "清空签名" };
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 22rem">
    <XhSignaturePadRoot read-only :translations="translations">
      <XhSignaturePadLabel>只读</XhSignaturePadLabel>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadPath />
      </XhSignaturePadControl>
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
    </XhSignaturePadRoot>
    <XhSignaturePadRoot disabled :translations="translations">
      <XhSignaturePadLabel>禁用</XhSignaturePadLabel>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadPath />
      </XhSignaturePadControl>
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
    </XhSignaturePadRoot>
  </div>
</template>
