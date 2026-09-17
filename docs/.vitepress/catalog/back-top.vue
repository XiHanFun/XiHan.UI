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
  <div style="position: relative; inline-size: 220px">
    <div ref="scrollEl" data-xh-scroll style="block-size: 150px; overflow: auto; padding-inline: 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-size: 13px">
      <section v-for="section in ['概览', '安装', '主题', '发布']" :key="section" style="min-block-size: 90px; padding-block: 10px">
        <strong>{{ section }}</strong>
        <p style="margin: 4px 0 0; color: var(--xh-fg-muted)">{{ section }}相关内容</p>
      </section>
    </div>
    <XhBackTopRoot :target="scrollEl" :visibility-height="100" style="position: absolute; --xh-back-top-inset-block: 10px; --xh-back-top-inset-inline: 10px">
      <XhBackTopTrigger />
    </XhBackTopRoot>
  </div>
</template>
