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
      style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px"
    >
      <strong>预览区域</strong>
      <p style="color: var(--xh-fg-muted)">拖动边缘调整画布大小。</p>
      <XhResizableHandle v-for="edge in EDGES" :key="edge" :edge="edge" />
    </XhResizableRoot>
  </div>
</template>
