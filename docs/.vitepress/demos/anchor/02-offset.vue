<!-- 判定线偏移 | 为吸顶内容预留空间 -->
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
  { value: "anchor-offset-a", label: "第一节" },
  { value: "anchor-offset-b", label: "第二节" },
  { value: "anchor-offset-c", label: "第三节" },
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
    <XhAnchorRoot :scroll-element="scrollEl" :offset="44" smooth>
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
        position: relative;
        block-size: 240px;
        overflow: auto;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <div
        style="
          position: sticky;
          inset-block-start: 0;
          z-index: 1;
          block-size: 44px;
          display: flex;
          align-items: center;
          padding-inline: 12px;
          background: var(--xh-bg-surface);
          border-block-end: 1px solid var(--xh-border-default);
        "
      >
        章节导航
      </div>

      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 180px; padding: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ s.label }}相关内容</p>
      </div>
    </div>
  </div>
</template>
