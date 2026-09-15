<!-- 基础用法 | 构建应用页面骨架 -->
<script setup lang="ts">
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";

const tones = ["brand", "info", "success"] as const;
</script>

<template>
  <XhLayoutRoot bordered sider-breakpoint="sm" aria-label="应用页面布局占位区块" style="inline-size: min(720px, 100%); block-size: 280px; border-radius: var(--xh-shape-surface); overflow: hidden">
    <XhLayoutHeader>
      <span data-demo-block="line" data-tone="brand" style="--xh-demo-block-inline-size: 112px" />
    </XhLayoutHeader>
    <XhLayoutSider>
      <div style="display: grid; gap: 12px">
        <span v-for="tone in tones" :key="tone" data-demo-block="line" :data-tone="tone" />
      </div>
    </XhLayoutSider>
    <XhLayoutContent>
      <span data-demo-block data-tone="info" style="--xh-demo-block-block-size: 112px" />
    </XhLayoutContent>
    <XhLayoutFooter>
      <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 80px" />
    </XhLayoutFooter>
  </XhLayoutRoot>
</template>
