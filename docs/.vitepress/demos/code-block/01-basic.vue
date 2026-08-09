<!-- 基础用法 | 代码原文由宿主给，组件负责数行数、预撑高度并铺记号；语言角标带 aria-hidden，是纯装饰 -->
<script setup lang="ts">
import { XhCodeBlock } from "@xihan-ui/vue";

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
  <!-- complete 表示这个块已闭合，可以放心着色 -->
  <XhCodeBlock :code="sample" lang="typescript" complete style="inline-size: 100%;" />
</template>
