<!-- 基础用法 | 代码原文由宿主给，组件切出逐行结构并铺记号；渲了文件名它就成为代码块的可访问名 -->
<script setup lang="ts">
import {
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewLangLabel,
  XhCodeViewPre,
  XhCodeViewRoot,
} from "@xihan-ui/vue";

const sample = `export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}`;
</script>

<template>
  <!-- complete 表示这段代码已经写完，可以放心着色 -->
  <XhCodeViewRoot
    :code="sample"
    lang="typescript"
    filename="ticker.ts"
    complete
    style="inline-size: 100%;"
  >
    <XhCodeViewHeader>
      <XhCodeViewFilename />
      <XhCodeViewLangLabel />
    </XhCodeViewHeader>
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
