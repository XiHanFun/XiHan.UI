<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const items = ["brand", "neutral", "info", "success", "warning", "danger", "brand", "info"] as const;
</script>

<template>
  <XhScrollAreaRoot style="block-size: var(--xh-doc-catalog-h); inline-size: var(--xh-doc-catalog-w); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <XhScrollAreaViewport>
      <XhScrollAreaContent aria-label="可滚动淡色区块" style="display: grid; gap: var(--xh-space-3); padding: var(--xh-space-3)">
        <span
          v-for="(tone, index) in items"
          :key="`${tone}-${index}`"
          data-demo-block="line"
          :data-tone="tone"
          aria-hidden="true"
          :style="{ '--xh-demo-block-inline-size': `${58 + (index % 3) * 16}%` }"
        />
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
