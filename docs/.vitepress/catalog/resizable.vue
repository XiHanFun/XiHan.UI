<script setup lang="ts">
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const dimensions = ref({ width: 180, height: 96 });
</script>

<template>
  <XhResizableRoot
    v-model:dimensions="dimensions"
    :min-width="140"
    :min-height="72"
    style="display: grid; place-items: center; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <span>可调区域</span>
    <XhResizableHandle edge="se" />
  </XhResizableRoot>
</template>
