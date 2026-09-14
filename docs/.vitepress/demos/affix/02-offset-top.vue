<!-- 顶部偏移 | 避让固定页头 -->
<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      position: relative;
      block-size: 240px;
      inline-size: min(420px, 100%);
      overflow: auto;
      padding: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div
      style="
        position: sticky;
        inset-block-start: 0;
        z-index: 1;
        block-size: 40px;
        display: flex;
        align-items: center;
        padding-inline: 8px;
        background: var(--xh-bg-subtle);
      "
    >
      吸顶栏
    </div>

    <div style="block-size: 120px" />

    <XhAffixRoot :target="scrollEl" :offset-top="40">
      <XhAffixContent
        style="
          padding: 8px 12px;
          border-radius: var(--xh-shape-control);
          background: var(--xh-bg-brand-subtle);
          color: var(--xh-fg-brand);
        "
      >
        二级工具栏
      </XhAffixContent>
    </XhAffixRoot>

    <div style="block-size: 600px" />
  </div>
</template>
