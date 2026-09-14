<script setup lang="ts">
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewRoot, XhDiffViewViewport } from "@xihan-ui/vue";

const before = `function clamp(n, min) {
  return Math.max(n, min)
}`;
const after = `function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max)
}`;
const model = computeTextDiff(before, after);
</script>

<template>
  <XhDiffViewRoot :model="model" style="inline-size: 250px; font-size: 11px">
    <XhDiffViewViewport>
      <XhDiffViewBody />
    </XhDiffViewViewport>
  </XhDiffViewRoot>
</template>
