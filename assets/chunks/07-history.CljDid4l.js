var e=`<!-- 撤销与重做 | 一笔或一次清空是一步；没有可撤销、可重做的一步时按钮置灰，焦点仍留在原处 -->
<script setup lang="ts">
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadPath,
  XhSignaturePadRedoTrigger,
  XhSignaturePadRoot,
  XhSignaturePadUndoTrigger,
} from "@xihan-ui/vue";

// 钮上的字要包含在读屏名里：名字取 translations，给一句以可见字开头的中文
const translations = { undoTrigger: "撤销上一笔", redoTrigger: "重做一笔", clearTrigger: "清空签名" };
<\/script>

<template>
  <XhSignaturePadRoot :translations="translations" style="max-inline-size: 22rem">
    <XhSignaturePadControl>
      <XhSignaturePadGuide />
      <XhSignaturePadPath />
    </XhSignaturePadControl>
    <div style="display: flex; gap: var(--xh-space-2)">
      <XhSignaturePadUndoTrigger>撤销</XhSignaturePadUndoTrigger>
      <XhSignaturePadRedoTrigger>重做</XhSignaturePadRedoTrigger>
      <!-- 清空也是一步：误清之后按撤销能把整份签名找回来 -->
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
    </div>
  </XhSignaturePadRoot>
</template>
`;export{e as default};