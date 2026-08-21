const n=`<!-- 基础用法 | 点触发器打开面板：标题栏那条把手可以拖，右下角可以改大小，Esc 关闭 -->
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
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <!-- 不传 open 即非受控；位置与尺寸同理，default-* 只给初值 -->
  <XhFloatingPanelRoot :default-position="{ x: 160, y: 140 }">
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>调试面板</XhFloatingPanelTitle>
          <!-- 把手自己不显示内容，它铺满标题栏剩下的横向空间 -->
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelCloseTrigger>✕</XhFloatingPanelCloseTrigger>
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">面板不挡住页面，底下的内容照常能点。</p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
`;export{n as default};
