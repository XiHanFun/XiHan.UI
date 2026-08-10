<!-- 基础用法 | 滚过判定线就把内容钉在滚动容器可视区的上边；占位盒留在原位，页面不跳 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 240px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <p style="block-size: 120px">往下滚，下面那条会钉在容器顶边。</p>

    <!-- target 指向真正在滚的那层；不给就按整页滚动算 -->
    <XhAffixRoot :target="scrollEl">
      <XhAffixContent
        style="
          padding: 8px 12px;
          border-radius: 6px;
          background: var(--xh-bg-brand);
          color: var(--xh-fg-on-brand);
        "
      >
        我会钉在顶边
      </XhAffixContent>
    </XhAffixRoot>

    <p style="block-size: 600px">后面还有很长的内容，一直滚到底再滚回去。</p>
  </div>
</template>
