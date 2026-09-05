<!-- 基础用法 | 触发器打开全屏看片：滚轮缩放、拖拽平移、工具条给缩放/旋转/翻转/归零，Esc 或点遮罩关闭 -->
<script setup lang="ts">
import {
  XhImageViewerCloseTrigger,
  XhImageViewerContent,
  XhImageViewerFlipHorizontalTrigger,
  XhImageViewerFlipVerticalTrigger,
  XhImageViewerImage,
  XhImageViewerResetTrigger,
  XhImageViewerRoot,
  XhImageViewerRotateLeftTrigger,
  XhImageViewerRotateRightTrigger,
  XhImageViewerToolbar,
  XhImageViewerTrigger,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
  XhImageViewerZoomOutTrigger,
} from "@xihan-ui/vue";

// 内联的示例图，省得示例依赖外部资源
const items = [{ src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E", alt: "雪山与云海" }];
</script>

<template>
  <XhImageViewerRoot :collection="items">
    <XhImageViewerTrigger>
      <img
        :src="items[0]!.src"
        :alt="items[0]!.alt"
        style="inline-size: 160px; border-radius: 8px; cursor: zoom-in; display: block"
      />
    </XhImageViewerTrigger>
    <XhImageViewerContent>
      <XhImageViewerViewport>
        <XhImageViewerImage />
      </XhImageViewerViewport>
      <XhImageViewerToolbar>
        <XhImageViewerZoomOutTrigger />
        <XhImageViewerZoomInTrigger />
        <XhImageViewerRotateLeftTrigger />
        <XhImageViewerRotateRightTrigger />
        <XhImageViewerFlipHorizontalTrigger />
        <XhImageViewerFlipVerticalTrigger />
        <XhImageViewerResetTrigger />
      </XhImageViewerToolbar>
      <XhImageViewerCloseTrigger />
    </XhImageViewerContent>
  </XhImageViewerRoot>
</template>
