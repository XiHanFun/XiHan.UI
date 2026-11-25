<!-- 滚动方向 | orientation 决定组件管理哪条轴：缺省 both 两个方向都能滚，两条滚动条交会处由 corner 补齐；horizontal 只启用横向滚动 -->
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
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-6)">
    <XhScrollAreaRoot
      reveal-mode="always"
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

    <XhScrollAreaRoot
      orientation="horizontal"
      reveal-mode="always"
      style="block-size: 110px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface)"
    >
      <XhScrollAreaViewport>
        <XhScrollAreaContent style="display: flex; gap: 10px; padding: 10px 12px">
          <div
            v-for="tone in tones"
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
  </div>
</template>
