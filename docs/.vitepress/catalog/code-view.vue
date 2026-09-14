<script setup lang="ts">
import { XhCodeViewCode, XhCodeViewFilename, XhCodeViewHeader, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";

const sample = `export function clamp(n: number) {
  return Math.min(Math.max(n, 0), 1)
}`;
</script>

<template>
  <XhCodeViewRoot :code="sample" lang="typescript" filename="clamp.ts" complete style="inline-size: 240px; font-size: 11px">
    <XhCodeViewHeader>
      <XhCodeViewFilename />
    </XhCodeViewHeader>
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
