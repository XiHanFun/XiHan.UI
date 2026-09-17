<!-- 基础用法 | 跟随滚动高亮当前章节 -->
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "anchor-basic-overview", label: "概览" },
  { value: "anchor-basic-install", label: "安装" },
  { value: "anchor-basic-theme", label: "主题" },
  { value: "anchor-basic-release", label: "发布" },
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
    <XhAnchorRoot :scroll-element="scrollEl" smooth>
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

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
