<!-- 禁用 | 把手全部退出 Tab 序列，按下也不进调整 -->
<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhResizableRoot
    disabled
    :default-dimensions="{ width: 240, height: 120 }"
    style="border: 1px solid var(--xh-border-default); border-radius: var(--xh-shape-surface); padding: 12px"
  >
    <span>尺寸锁定</span>
    <XhResizableHandle v-for="edge in ['e', 's', 'se']" :key="edge" :edge="edge as never" />
  </XhResizableRoot>
</template>
