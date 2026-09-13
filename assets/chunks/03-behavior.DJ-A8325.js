const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 滚动方式 | 平滑返回或立即返回 -->
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const sections = ["概览", "配置", "接口", "发布"];
const smoothEl = ref<HTMLElement | null>(null);
const autoEl = ref<HTMLElement | null>(null);
<\/script>

<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; inline-size: min(640px, 100%)">
    <div style="position: relative">
      <div
        ref="smoothEl"
        style="block-size: 200px; overflow: auto; padding-inline: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
      >
        <p v-for="section in sections" :key="section" style="min-block-size: 64px">平滑 · {{ section }}</p>
      </div>
      <XhBackTopRoot
        :target="smoothEl"
        behavior="smooth"
        :visibility-height="40"
        size="sm"
        style="position: absolute; --xh-back-top-inset-block: 10px; --xh-back-top-inset-inline: 10px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>

    <div style="position: relative">
      <div
        ref="autoEl"
        style="block-size: 200px; overflow: auto; padding-inline: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
      >
        <p v-for="section in sections" :key="section" style="min-block-size: 64px">立即 · {{ section }}</p>
      </div>
      <XhBackTopRoot
        :target="autoEl"
        behavior="auto"
        :visibility-height="40"
        size="sm"
        style="position: absolute; --xh-back-top-inset-block: 10px; --xh-back-top-inset-inline: 10px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  </div>
</template>
`;export{n as default};
