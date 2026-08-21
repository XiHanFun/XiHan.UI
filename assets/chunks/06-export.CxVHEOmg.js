const n=`<!-- 取出签名 | 签名定稿时 draw-end 带上一份可直接落库的 SVG；提交前用 empty 拦一道，空签名不该走出客户端 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadRoot,
  XhSignaturePadSegment,
} from "@xihan-ui/vue";

const size = ref(0);

// 签名定稿才发一次：抬笔、清空与表单重置三条路径都会走到这里
function onDrawEnd(details: { paths: string[]; svg: string }) {
  size.value = details.svg.length;
}
<\/script>

<template>
  <XhSignaturePadRoot v-slot="{ empty }" style="max-inline-size: 22rem" @draw-end="onDrawEnd">
    <XhSignaturePadControl>
      <XhSignaturePadGuide />
      <XhSignaturePadSegment />
    </XhSignaturePadControl>
    <div style="display: flex; gap: 8px; align-items: center">
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
      <!-- 空签名与"签了但很潦草"是两回事，前者应该在客户端就挡住 -->
      <button type="button" :disabled="empty">提交</button>
      <span style="font-size: 12px">SVG {{ size }} 字节</span>
    </div>
  </XhSignaturePadRoot>
</template>
`;export{n as default};
