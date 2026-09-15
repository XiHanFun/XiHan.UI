<!-- 侧栏位置 | 将侧栏放在行首或行尾 -->
<script setup lang="ts">
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: min(560px, 100%)">
    <XhLayoutRoot bordered aria-label="行首侧栏布局" style="block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden">
      <XhLayoutHeader><span data-demo-block="line" data-tone="brand" /></XhLayoutHeader><XhLayoutSider><span data-demo-block data-tone="info" style="--xh-demo-block-block-size: 100%" /></XhLayoutSider><XhLayoutContent><span data-demo-block data-tone="success" style="--xh-demo-block-block-size: 100%" /></XhLayoutContent>
    </XhLayoutRoot>
    <XhLayoutRoot sider-placement="end" bordered aria-label="行尾侧栏布局" style="block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden">
      <XhLayoutHeader><span data-demo-block="line" data-tone="warning" /></XhLayoutHeader><XhLayoutSider><span data-demo-block data-tone="danger" style="--xh-demo-block-block-size: 100%" /></XhLayoutSider><XhLayoutContent><span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: 100%" /></XhLayoutContent>
    </XhLayoutRoot>
  </div>
</template>
