<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { onMounted, ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
// 预览里没人滚动：先滚过阈值，按钮才有得看
onMounted(() => {
  if (scrollEl.value)
    scrollEl.value.scrollTop = 200;
});
</script>

<template>
  <div style="position: relative; inline-size: var(--xh-doc-catalog-w)">
    <div ref="scrollEl" data-xh-scroll style="block-size: var(--xh-doc-catalog-h); overflow: auto; padding-inline: var(--xh-space-3); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
      <section v-for="section in ['概览', '安装', '主题', '发布']" :key="section" style="min-block-size: 90px; padding-block: var(--xh-space-2_5)">
        <strong>{{ section }}</strong>
        <div style="margin-block-start: var(--xh-space-1); color: var(--xh-fg-muted)">{{ section }}相关内容</div>
      </section>
    </div>
    <XhBackTopRoot :target="scrollEl" :visibility-height="100" style="position: absolute; --xh-back-top-inset-block: var(--xh-space-2_5); --xh-back-top-inset-inline: var(--xh-space-2_5)">
      <XhBackTopTrigger />
    </XhBackTopRoot>
  </div>
</template>
