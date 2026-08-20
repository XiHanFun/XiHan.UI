<!-- 八个改尺把手 | 四条边加四个角；min-size 与 max-size 在拖、推、setSize 三处同时生效 -->
<script setup lang="ts">
import type { FloatingPanelResizeEdge } from "@xihan-ui/headless";
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelResizeTrigger,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
} from "@xihan-ui/vue";

// 边先角后：角上的把手要盖在两条边的交叠处
const edges: FloatingPanelResizeEdge[] = [
  "n",
  "e",
  "s",
  "w",
  "ne",
  "se",
  "sw",
  "nw",
];
</script>

<template>
  <XhFloatingPanelRoot
    :default-position="{ x: 240, y: 220 }"
    :default-size="{ width: 320, height: 200 }"
    :min-size="{ width: 240, height: 160 }"
    :max-size="{ width: 520, height: 420 }"
  >
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>图层属性</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelCloseTrigger>✕</XhFloatingPanelCloseTrigger>
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            往任一边拖到底就停在 240×160；把手聚焦后方向键推 10px、Shift 推
            50px。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger
          v-for="edge in edges"
          :key="edge"
          :edge="edge"
        />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
