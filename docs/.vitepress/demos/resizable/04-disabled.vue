<!-- 禁用 | 禁止调整尺寸 -->
<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhResizableRoot
    disabled
    :default-dimensions="{ width: 240, height: 120 }"
    style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px"
  >
    <span>尺寸锁定</span>
    <XhResizableHandle v-for="edge in ['e', 's', 'se']" :key="edge" :edge="edge as never" />
  </XhResizableRoot>
</template>
