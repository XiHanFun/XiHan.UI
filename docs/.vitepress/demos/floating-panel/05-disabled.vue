<!-- 禁用 | 搬不动、改不了尺寸、切不了形态；关闭与开合照常，面板不会被锁死在屏幕上 -->
<script setup lang="ts">
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelResizeTrigger,
  XhFloatingPanelRoot,
  XhFloatingPanelWindowStateTrigger,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhFloatingPanelRoot disabled :default-position="{ x: 320, y: 300 }">
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>只读面板</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelWindowStateTrigger window-state="minimized" />
          <XhFloatingPanelCloseTrigger />
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            把手报的是 aria-disabled 而不是原生 disabled：它仍在 Tab
            序列里，读屏才念得到"这里本来能搬"。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
