<!-- 基础用法 | 从右侧、底部或右下角调整尺寸 -->
<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const dimensions = ref({ width: 260, height: 140 });
const EDGES = ["e", "s", "se"] as const;
</script>

<template>
  <div style="padding: 12px">
    <XhResizableRoot
      v-model:dimensions="dimensions"
      :min-width="120"
      :min-height="80"
      :max-width="480"
      aria-label="可调整尺寸的占位区块"
      style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px"
    >
      <span data-demo-block data-tone="warning" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%" />
      <XhResizableHandle v-for="edge in EDGES" :key="edge" :edge="edge" />
    </XhResizableRoot>
  </div>
</template>
