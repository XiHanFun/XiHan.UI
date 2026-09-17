<!-- 固定区域 | 固定页头和侧栏 -->
<script setup lang="ts">
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";

const tones = ["brand", "info", "success", "warning", "danger", "neutral"] as const;
const rows = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, tone: tones[index % tones.length] }));
</script>

<template>
  <div data-xh-scroll style="inline-size: min(640px, 100%); block-size: 260px; overflow: auto; border-radius: var(--xh-shape-surface); background: var(--xh-bg-page)">
    <XhLayoutRoot header-fixed sider-fixed split style="--xh-layout-scrollport-h: 260px">
      <XhLayoutHeader><span data-demo-block="line" data-tone="brand" style="--xh-demo-block-inline-size: 96px" /></XhLayoutHeader>
      <XhLayoutSider><span data-demo-block data-tone="info" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%" /></XhLayoutSider>
      <XhLayoutContent><span v-for="row in rows" :key="row.id" data-demo-block="line" :data-tone="row.tone" style="margin-block: 16px" /></XhLayoutContent>
      <XhLayoutFooter><span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 80px" /></XhLayoutFooter>
    </XhLayoutRoot>
  </div>
</template>
