<!-- 文案本地化 | 把手与几个按钮只有图标，可及名一律走 translations -->
<script setup lang="ts">
import type { FloatingPanelSchema } from "@xihan-ui/headless";
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

// 八个把手与三个形态钮的名字带参数：读屏得念得出按的是哪一个
const EDGE_LABEL = {
  n: "上边",
  e: "右边",
  s: "下边",
  w: "左边",
  ne: "右上角",
  se: "右下角",
  sw: "左下角",
  nw: "左上角",
};

const STAGE_LABEL = {
  default: "还原面板",
  minimized: "收起面板",
  maximized: "最大化面板",
};

const translations: FloatingPanelSchema["props"]["translations"] = {
  dragTrigger: "移动面板",
  resizeTrigger: (edge) => `拖动${EDGE_LABEL[edge]}改变大小`,
  resizeValueText: (size) => `宽 ${size.width}、高 ${size.height} 像素`,
  stageTrigger: (stage) => STAGE_LABEL[stage],
  close: "关闭面板",
};
</script>

<template>
  <XhFloatingPanelRoot
    :translations="translations"
    :default-position="{ x: 360, y: 340 }"
  >
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>中文面板</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelStageTrigger stage="minimized" />
          <XhFloatingPanelCloseTrigger />
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            这几处名字只出现在读屏里，界面上一个字都看不见。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
