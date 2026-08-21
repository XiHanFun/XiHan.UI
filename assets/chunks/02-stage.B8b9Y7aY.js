const n=`<!-- 三种形态 | 收拢只留标题栏、铺满占满视口；按着的那个钮再按一次回到常规 -->
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
  XhFloatingPanelStageTrigger,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhFloatingPanelRoot :default-position="{ x: 200, y: 180 }">
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>播放器</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <!-- 当前形态的那个钮会被压住（aria-pressed=true） -->
          <XhFloatingPanelStageTrigger stage="minimized"
            >—</XhFloatingPanelStageTrigger
          >
          <XhFloatingPanelStageTrigger stage="maximized"
            >▢</XhFloatingPanelStageTrigger
          >
          <XhFloatingPanelCloseTrigger>✕</XhFloatingPanelCloseTrigger>
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            收拢时这段正文带上 hidden，Tab 与读屏都进不来。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
`;export{n as default};
