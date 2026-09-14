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
  <div style="display: grid; grid-template-columns: 80px 1fr; gap: 12px; inline-size: 230px; align-items: start; font-size: 13px">
    <XhAnchorRoot :scroll-element="scrollEl">
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>
    <div ref="scrollEl" style="block-size: 130px; overflow: auto; padding-inline: 10px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
      <div v-for="s in sections" :id="s.value" :key="s.value" style="block-size: 90px; padding-block: 8px">
        <strong>{{ s.label }}</strong>
        <p style="margin: 4px 0 0; color: var(--xh-fg-muted)">{{ s.label }}相关内容</p>
      </div>
    </div>
  </div>
</template>
