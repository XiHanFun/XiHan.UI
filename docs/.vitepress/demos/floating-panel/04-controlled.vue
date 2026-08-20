<!-- 受控 | open 与 position 都交给外面握着：面板只报意图，值写回来才动 -->
<script setup lang="ts">
import type { FloatingPanelPosition } from "@xihan-ui/headless";
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

const open = ref(false);
const position = ref<FloatingPanelPosition>({ x: 280, y: 260 });
</script>

<template>
  <p style="margin: 0 0 8px">
    面板落点：{{ Math.round(position.x) }} , {{ Math.round(position.y) }}
  </p>
  <XhFloatingPanelRoot v-model:open="open" v-model:position="position">
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>受控面板</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelCloseTrigger>✕</XhFloatingPanelCloseTrigger>
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            拖动时上面那行数字跟着走：值是外面这份 ref 说了算。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
