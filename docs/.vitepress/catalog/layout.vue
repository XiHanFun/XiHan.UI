<script setup lang="ts">
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot split sider-width="72px" aria-label="页头、侧栏与内容区布局预览" style="inline-size: 240px; block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden">
    <XhLayoutHeader>
      <span data-demo-block="line" data-tone="brand" aria-hidden="true" style="--xh-demo-block-inline-size: 72px" />
    </XhLayoutHeader>
    <XhLayoutSider>
      <div aria-hidden="true" style="display: grid; gap: 8px">
        <span data-demo-block="line" data-tone="neutral" />
        <span data-demo-block="line" data-tone="info" />
        <span data-demo-block="line" data-tone="success" />
      </div>
    </XhLayoutSider>
    <XhLayoutContent>
      <div aria-hidden="true" style="display: grid; gap: 8px">
        <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: 48px" />
        <span data-demo-block="line" data-tone="warning" style="--xh-demo-block-inline-size: 72%" />
      </div>
    </XhLayoutContent>
  </XhLayoutRoot>
</template>
