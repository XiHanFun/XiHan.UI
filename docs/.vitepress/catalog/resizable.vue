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
    aria-label="可调区块预览"
    style="display: grid; place-items: center; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <span data-demo-block data-tone="brand" aria-hidden="true" style="--xh-demo-block-inline-size: 64%; --xh-demo-block-block-size: 48px" />
    <XhResizableHandle edge="se" />
  </XhResizableRoot>
</template>
