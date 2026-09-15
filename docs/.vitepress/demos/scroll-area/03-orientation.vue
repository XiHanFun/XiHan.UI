<!-- 横向滚动 | 只启用横向滚动 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const cards = ["brand", "info", "success", "warning", "danger", "neutral"] as const;
</script>

<template>
  <XhScrollAreaRoot
    orientation="horizontal"
    type="always"
    style="block-size: 110px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface)"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="display: flex; gap: 10px; padding: 10px 12px">
        <div
          v-for="tone in cards"
          :key="tone"
          data-demo-block
          :data-tone="tone"
          style="
            flex: none;
            inline-size: 96px;
            block-size: 64px;
          "
        />
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="horizontal">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
