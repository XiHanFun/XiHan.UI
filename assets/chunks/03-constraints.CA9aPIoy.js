const e=`<!-- 约束 | 设置宽高比和步进 -->
<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ratio = ref({ width: 240, height: 135 });
const snapped = ref({ width: 240, height: 120 });
<\/script>

<template>
  <div style="display: grid; gap: 24px">
    <div>
      <p style="margin-bottom: 8px">16:9 宽高比</p>
      <XhResizableRoot
        v-model:dimensions="ratio"
        :aspect-ratio="16 / 9"
        :edges="['e', 's', 'se']"
        :min-width="160"
        style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px"
      >
        <span>{{ Math.round(ratio.width) }} × {{ Math.round(ratio.height) }}</span>
        <XhResizableHandle v-for="edge in ['e', 's', 'se']" :key="edge" :edge="edge as never" />
      </XhResizableRoot>
    </div>

    <div>
      <p style="margin-bottom: 8px">40px 步进</p>
      <XhResizableRoot
        v-model:dimensions="snapped"
        :step="40"
        :edges="['e', 's', 'se']"
        :min-width="120"
        :min-height="80"
        style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px"
      >
        <span>{{ snapped.width }} × {{ snapped.height }}</span>
        <XhResizableHandle v-for="edge in ['e', 's', 'se']" :key="edge" :edge="edge as never" />
      </XhResizableRoot>
    </div>
  </div>
</template>
`;export{e as default};
