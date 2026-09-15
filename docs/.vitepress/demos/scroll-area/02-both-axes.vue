<!-- 双轴滚动 | 同时显示横向和纵向滚动条 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaCorner,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const tones = ["brand", "info", "success", "warning", "danger", "neutral"] as const;
const rows = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, tone: tones[index % tones.length] }));
</script>

<template>
  <XhScrollAreaRoot
    type="always"
    aria-label="双轴滚动占位区块"
    style="block-size: 160px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 12px 16px">
        <span
          v-for="row in rows"
          :key="row.id"
          data-demo-block="line"
          :data-tone="row.tone"
          style="--xh-demo-block-inline-size: 560px; margin-block: 14px"
        />
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
      <XhScrollAreaCorner />
    </XhScrollAreaScrollbar>
    <XhScrollAreaScrollbar orientation="horizontal">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
