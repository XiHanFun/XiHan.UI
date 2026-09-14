<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="block-size: 150px; inline-size: 220px; overflow: auto; padding: 8px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-size: 13px"
  >
    <div style="padding: 6px 8px; color: var(--xh-fg-muted)">项目概览</div>
    <XhAffixRoot :target="scrollEl">
      <XhAffixContent style="padding: 6px 10px; border-radius: var(--xh-shape-control); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand)">
        筛选与操作
      </XhAffixContent>
    </XhAffixRoot>
    <div style="block-size: 400px; padding: 8px; color: var(--xh-fg-muted)">项目动态<br><br>最近访问<br><br>团队成员</div>
  </div>
</template>
