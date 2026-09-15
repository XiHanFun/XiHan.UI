const n=`<!-- 基础用法 | 滚动后固定工具栏 -->
<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
<\/script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 240px;
      inline-size: min(420px, 100%);
      overflow: auto;
      padding: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div style="block-size: 120px; padding: 8px">项目概览</div>

    <XhAffixRoot :target="scrollEl">
      <XhAffixContent
        style="
          padding: 8px 12px;
          border-radius: var(--xh-shape-control);
          background: var(--xh-bg-brand-subtle);
          color: var(--xh-fg-brand);
        "
      >
        筛选与操作
      </XhAffixContent>
    </XhAffixRoot>

    <div style="block-size: 600px; padding: 12px">项目动态<br><br>最近访问<br><br>团队成员</div>
  </div>
</template>
`;export{n as default};
