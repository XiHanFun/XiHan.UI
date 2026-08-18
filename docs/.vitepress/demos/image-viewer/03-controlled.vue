<!-- 受控与文案 | open 与 index 双受控；translations 换工具条的可及名与计数文案 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhImageViewerCloseTrigger,
  XhImageViewerContent,
  XhImageViewerCounter,
  XhImageViewerImage,
  XhImageViewerNextTrigger,
  XhImageViewerPrevTrigger,
  XhImageViewerRoot,
  XhImageViewerViewport,
} from "@xihan-ui/vue";

// 内联的示例图，省得示例依赖外部资源
const items = [
  { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E", alt: "雪山" },
  { src: "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%237c3aed%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%23c4b5fd%22/%3E%3C/svg%3E", alt: "暮色" },
];

const open = ref(false);
const index = ref(1);

const translations = {
  close: "关闭",
  prev: "上一张",
  next: "下一张",
  counter: (i: number, n: number) => `第 ${i} 张，共 ${n} 张`,
};
</script>

<template>
  <XhImageViewerRoot
    v-model:open="open"
    v-model:index="index"
    :items="items"
    :translations="translations"
  >
    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="solid" @click="open = true">从第 {{ index + 1 }} 张看起</XhButton>
      <span>open：{{ open }}，index：{{ index }}</span>
    </div>
    <XhImageViewerContent>
      <XhImageViewerViewport>
        <XhImageViewerImage />
      </XhImageViewerViewport>
      <XhImageViewerCounter />
      <XhImageViewerPrevTrigger />
      <XhImageViewerNextTrigger />
      <XhImageViewerCloseTrigger />
    </XhImageViewerContent>
  </XhImageViewerRoot>
</template>
