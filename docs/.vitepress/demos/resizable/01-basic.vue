<!-- 基础用法 | 八条边各一个把手；拖动改尺寸，Tab 到把手用方向键也能推 -->
<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const dimensions = ref({ width: 260, height: 140 });
const EDGES = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;
</script>

<template>
  <!-- 留出余量：把手压在边上，往外挪了半个身位 -->
  <div style="padding: 12px">
    <XhResizableRoot
      v-model:dimensions="dimensions"
      :min-width="120"
      :min-height="80"
      :max-width="480"
      style="border: 1px solid var(--xh-border-default); border-radius: var(--xh-shape-surface); padding: 12px"
    >
      <span>拖任意一条边或一个角</span>
      <XhResizableHandle v-for="edge in EDGES" :key="edge" :edge="edge" />
    </XhResizableRoot>
  </div>
  <p style="margin-top: 12px; color: var(--xh-fg-muted)">
    {{ Math.round(dimensions.width) }} × {{ Math.round(dimensions.height) }}
  </p>
</template>
