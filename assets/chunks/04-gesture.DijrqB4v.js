const e=`<!-- 双指缩放 | 触屏上两指撑开放大、捏合缩小，单指平移；缩放夹在 minScale 与 maxScale 之间 -->
<script setup lang="ts">
import {
  XhImageViewerCloseTrigger,
  XhImageViewerContent,
  XhImageViewerImage,
  XhImageViewerResetTrigger,
  XhImageViewerRoot,
  XhImageViewerToolbar,
  XhImageViewerTrigger,
  XhImageViewerViewport,
} from "@xihan-ui/vue";

// 内联的示例图，省得示例依赖外部资源
const items = [{ src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23334155%22/%3E%3Ccircle%20cx=%224%22%20cy=%223%22%20r=%221.4%22%20fill=%22%23fbbf24%22/%3E%3Cpath%20d=%22M0%209%205%204%2010%209z%22%20fill=%22%2364748b%22/%3E%3Cpath%20d=%22M7%209%2012%202%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E", alt: "山谷日落" }];
<\/script>

<template>
  <XhImageViewerRoot :items="items" :min-scale="0.5" :max-scale="4">
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
        <XhImageViewerResetTrigger />
      </XhImageViewerToolbar>
      <XhImageViewerCloseTrigger />
    </XhImageViewerContent>
  </XhImageViewerRoot>
</template>
`;export{e as default};
