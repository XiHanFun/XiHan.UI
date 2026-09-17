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
import { ref } from "vue";

// 面板 portal 到触发器下方这块落点里并改成静态定位：不再钉视口坐标，就地摆在触发器下方
const host = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-2); justify-items: start; inline-size: var(--xh-doc-catalog-w)">
    <XhFloatingPanelRoot default-open :default-dimensions="{ width: 240, height: 120 }">
      <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
      <XhFloatingPanelPositioner v-if="host" :container="host" style="position: static">
        <XhFloatingPanelContent>
          <XhFloatingPanelHeader>
            <XhFloatingPanelTitle>调试面板</XhFloatingPanelTitle>
            <XhFloatingPanelDragTrigger />
            <XhFloatingPanelCloseTrigger />
          </XhFloatingPanelHeader>
          <XhFloatingPanelBody>面板不挡住页面，底下的内容照常能点。</XhFloatingPanelBody>
          <XhFloatingPanelResizeTrigger edge="se" />
        </XhFloatingPanelContent>
      </XhFloatingPanelPositioner>
    </XhFloatingPanelRoot>
    <div ref="host" />
  </div>
</template>
