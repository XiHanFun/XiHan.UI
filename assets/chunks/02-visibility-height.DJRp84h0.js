const n=`<!-- 显示阈值 | 提前显示回到顶部按钮 -->
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const sections = ["快速开始", "基础配置", "主题定制", "部署"];
const scrollEl = ref<HTMLElement | null>(null);
<\/script>

<template>
  <div style="position: relative; inline-size: min(560px, 100%)">
    <div
      ref="scrollEl"
      style="
        block-size: 220px;
        overflow: auto;
        padding-inline: 16px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <section v-for="section in sections" :key="section" style="min-block-size: 88px; padding-block: 14px">
        <strong>{{ section }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ section }}相关内容</p>
      </section>
    </div>

    <XhBackTopRoot
      :target="scrollEl"
      :visibility-height="48"
      style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
    >
      <XhBackTopTrigger />
    </XhBackTopRoot>
  </div>
</template>
`;export{n as default};
