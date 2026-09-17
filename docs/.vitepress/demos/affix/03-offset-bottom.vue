<!-- 底部固定 | 将操作栏固定在底部 -->
<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    data-xh-scroll
    style="
      block-size: 240px;
      inline-size: min(420px, 100%);
      overflow: auto;
      padding: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div style="block-size: 80px">订单列表</div>

    <XhAffixRoot :target="scrollEl" :offset-bottom="12">
      <XhAffixContent
        style="
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          border-radius: var(--xh-shape-control);
          background: var(--xh-bg-surface-raised);
          box-shadow: var(--xh-elevation-floating);
        "
      >
        <span>共 42 项</span>
        <span>已选 3 项</span>
      </XhAffixContent>
    </XhAffixRoot>

    <div style="block-size: 600px" />
  </div>
</template>
