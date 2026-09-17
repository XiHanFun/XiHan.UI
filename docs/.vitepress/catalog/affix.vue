<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    data-xh-scroll
    style="block-size: var(--xh-doc-catalog-h); inline-size: var(--xh-doc-catalog-w); overflow: auto; padding: var(--xh-space-2); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <div style="padding: var(--xh-space-1_5) var(--xh-space-2); color: var(--xh-fg-muted)">项目概览</div>
    <XhAffixRoot :target="scrollEl">
      <XhAffixContent style="padding: var(--xh-space-1_5) var(--xh-space-2_5); border-radius: var(--xh-shape-control); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand)">
        筛选与操作
      </XhAffixContent>
    </XhAffixRoot>
    <div style="block-size: 400px; padding: var(--xh-space-2); color: var(--xh-fg-muted)">项目动态<br><br>最近访问<br><br>团队成员</div>
  </div>
</template>
