<!-- 禁用 | 禁止调整尺寸 -->
<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhResizableRoot
    disabled
    :default-dimensions="{ width: 240, height: 120 }"
    aria-label="已锁定尺寸的占位区块"
    style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px"
  >
    <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%" />
    <XhResizableHandle v-for="edge in ['e', 's', 'se']" :key="edge" :edge="edge as never" />
  </XhResizableRoot>
</template>
