<!-- 标题、基准线与清空 | 基准线是纯画面（带 aria-hidden），清空按钮是原生 button，读屏念的是 translations 里那句 -->
<script setup lang="ts">
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadLabel,
  XhSignaturePadRoot,
  XhSignaturePadPath,
} from "@xihan-ui/vue";
</script>

<template>
  <XhSignaturePadRoot
    :translations="{ label: '手写签名', clearTrigger: '清空签名' }"
    style="max-inline-size: 22rem"
  >
    <XhSignaturePadLabel>请在下方签名</XhSignaturePadLabel>
    <XhSignaturePadControl>
      <XhSignaturePadGuide />
      <XhSignaturePadPath />
    </XhSignaturePadControl>
    <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
  </XhSignaturePadRoot>
</template>
