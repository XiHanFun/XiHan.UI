<!-- 基础用法 | 滚过 200px 按钮才露面，点它滚回顶部 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <!-- 定位壳缺省钉在视口一角；这里把它改成钉在面板内，示例才不必占用整页 -->
  <div style="position: relative; inline-size: 100%">
    <div
      ref="scrollEl"
      style="
        block-size: 240px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <p v-for="i in 20" :key="i" style="margin: 0 0 12px">第 {{ i }} 段内容，往下滚。</p>
    </div>

    <XhBackTopRoot
      :target="scrollEl"
      style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
    >
      <XhBackTopTrigger>↑</XhBackTopTrigger>
    </XhBackTopRoot>
  </div>
</template>
