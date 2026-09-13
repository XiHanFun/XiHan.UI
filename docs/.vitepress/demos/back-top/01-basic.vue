<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 滚动后显示回到顶部按钮 -->
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const sections = ["概览", "安装", "主题", "发布"];
const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="position: relative; inline-size: min(560px, 100%)">
    <div
      ref="scrollEl"
      style="
        block-size: 240px;
        overflow: auto;
        padding-inline: 16px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <section v-for="section in sections" :key="section" style="min-block-size: 104px; padding-block: 16px">
        <strong>{{ section }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ section }}相关内容</p>
      </section>
    </div>

    <XhBackTopRoot
      :target="scrollEl"
      :visibility-height="120"
      style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
    >
      <XhBackTopTrigger />
    </XhBackTopRoot>
  </div>
</template>
