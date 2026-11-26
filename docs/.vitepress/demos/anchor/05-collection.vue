<!-- 数据写法 | 只给 collection、不写结构时按标准结构铺：一条一个链接，文字取 label，末尾带滑动的指示条 -->
<script setup lang="ts">
import { XhAnchorRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "anchor-data-overview", label: "概览" },
  { value: "anchor-data-install", label: "安装" },
  { value: "anchor-data-theme", label: "主题" },
  { value: "anchor-data-release", label: "发布" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: minmax(112px, 140px) minmax(0, 1fr);
      gap: 20px;
      inline-size: min(640px, 100%);
      align-items: start;
    "
  >
    <XhAnchorRoot :collection="sections" :target="scrollEl" smooth />

    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        block-size: 240px;
        overflow: auto;
        padding-inline: 12px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 160px; padding-block: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ s.label }}相关内容</p>
      </div>
    </div>
  </div>
</template>
