const n=`<!-- 滚动方式 | behavior=auto 一步跳回顶部，smooth 平滑滚过去 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";

const smoothEl = ref<HTMLElement | null>(null);
const autoEl = ref<HTMLElement | null>(null);
<\/script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; inline-size: 100%">
    <div style="position: relative">
      <div
        ref="smoothEl"
        style="
          block-size: 200px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <p v-for="i in 16" :key="i" style="margin: 0 0 12px">smooth · 第 {{ i }} 段</p>
      </div>
      <XhBackTopRoot
        :target="smoothEl"
        behavior="smooth"
        size="sm"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger>↑</XhBackTopTrigger>
      </XhBackTopRoot>
    </div>

    <div style="position: relative">
      <div
        ref="autoEl"
        style="
          block-size: 200px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <p v-for="i in 16" :key="i" style="margin: 0 0 12px">auto · 第 {{ i }} 段</p>
      </div>
      <XhBackTopRoot
        :target="autoEl"
        behavior="auto"
        size="sm"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger>↑</XhBackTopTrigger>
      </XhBackTopRoot>
    </div>
  </div>
</template>
`;export{n as default};
