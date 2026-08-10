<!-- 贴下边 | 给了 offset-bottom 就改贴可视区的下边，判定线也换到下边 -->
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
    <p style="block-size: 80px">这块工具条在滚到它之前就贴在容器底边，滚过去之后回到常规流。</p>

    <XhAffixRoot :target="scrollEl" :offset-bottom="12">
      <XhAffixContent
        style="
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          background: var(--xh-bg-surface-raised);
          box-shadow: var(--xh-elevation-2);
        "
      >
        <span>共 42 项</span>
        <span>已选 3 项</span>
      </XhAffixContent>
    </XhAffixRoot>

    <p style="block-size: 600px">下面是很长的列表内容。</p>
  </div>
</template>
