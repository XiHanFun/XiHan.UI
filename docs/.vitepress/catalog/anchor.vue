<script setup lang="ts">
import { XhAnchorIndicator, XhAnchorItem, XhAnchorLink, XhAnchorList, XhAnchorRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "catalog-anchor-overview", label: "概览" },
  { value: "catalog-anchor-install", label: "安装" },
  { value: "catalog-anchor-theme", label: "主题" },
];
const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="display: grid; grid-template-columns: 80px 1fr; gap: var(--xh-space-3); inline-size: var(--xh-doc-catalog-w); align-items: start">
    <XhAnchorRoot :scroll-element="scrollEl">
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>
    <div ref="scrollEl" data-xh-scroll style="block-size: var(--xh-doc-catalog-h); overflow: auto; padding-inline: var(--xh-space-2_5); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
      <div v-for="s in sections" :id="s.value" :key="s.value" style="block-size: 90px; padding-block: var(--xh-space-2)">
        <strong>{{ s.label }}</strong>
        <div style="margin-block-start: var(--xh-space-1); color: var(--xh-fg-muted)">{{ s.label }}相关内容</div>
      </div>
    </div>
  </div>
</template>
