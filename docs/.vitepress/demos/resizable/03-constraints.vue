<!-- 约束 | 上下限夹住范围，aspectRatio 锁宽高比，step 吸附到整数倍 -->
<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ratio = ref({ width: 240, height: 135 });
const snapped = ref({ width: 240, height: 120 });
</script>

<template>
  <div style="display: grid; gap: 24px">
    <div>
      <p style="margin-bottom: 8px">锁 16:9——推一条边，另一轴跟着算</p>
      <XhResizableRoot
        v-model:size="ratio"
        :aspect-ratio="16 / 9"
        :edges="['e', 's', 'se']"
        :min-width="160"
        style="border: 1px solid var(--xh-border-default); border-radius: var(--xh-shape-surface); padding: 12px"
      >
        <span>{{ Math.round(ratio.width) }} × {{ Math.round(ratio.height) }}</span>
        <XhResizableHandle v-for="edge in ['e', 's', 'se']" :key="edge" :edge="edge as never" />
      </XhResizableRoot>
    </div>

    <div>
      <p style="margin-bottom: 8px">吸附到 40 的整数倍</p>
      <XhResizableRoot
        v-model:size="snapped"
        :step="40"
        :edges="['e', 's', 'se']"
        :min-width="120"
        :min-height="80"
        style="border: 1px solid var(--xh-border-default); border-radius: var(--xh-shape-surface); padding: 12px"
      >
        <span>{{ snapped.width }} × {{ snapped.height }}</span>
        <XhResizableHandle v-for="edge in ['e', 's', 'se']" :key="edge" :edge="edge as never" />
      </XhResizableRoot>
    </div>
  </div>
</template>
