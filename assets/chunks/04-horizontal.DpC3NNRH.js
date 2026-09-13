const n=`<!-- 横向排列 | 在内容上方显示章节导航 -->
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
  { value: "anchor-h-overview", label: "概览" },
  { value: "anchor-h-props", label: "属性" },
  { value: "anchor-h-events", label: "事件" },
  { value: "anchor-h-slots", label: "插槽" },
];

const scrollEl = ref<HTMLElement | null>(null);
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: min(640px, 100%)">
    <XhAnchorRoot
      :scroll-element="scrollEl"
      orientation="horizontal"
      smooth
    >
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      style="
        block-size: 220px;
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
        style="block-size: 170px; padding-block: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ s.label }}相关内容</p>
      </div>
    </div>
  </div>
</template>
`;export{n as default};
