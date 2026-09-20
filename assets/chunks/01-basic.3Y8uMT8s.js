const n=`<!-- 基础用法 | 创建纵向滚动区域 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const items = [
  { id: 1, tone: "brand", width: "76%" },
  { id: 2, tone: "info", width: "58%" },
  { id: 3, tone: "success", width: "84%" },
  { id: 4, tone: "warning", width: "66%" },
  { id: 5, tone: "danger", width: "72%" },
  { id: 6, tone: "neutral", width: "54%" },
  { id: 7, tone: "brand", width: "80%" },
  { id: 8, tone: "info", width: "62%" },
  { id: 9, tone: "success", width: "74%" },
  { id: 10, tone: "warning", width: "56%" },
] as const;
<\/script>

<template>
  <XhScrollAreaRoot type="always" aria-label="纵向滚动占位区块" style="block-size: 180px; inline-size: min(360px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 12px 16px">
        <span
          v-for="item in items"
          :key="item.id"
          data-demo-block="line"
          :data-tone="item.tone"
          :style="{ '--xh-demo-block-inline-size': item.width, 'marginBlock': '14px' }"
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
`;export{n as default};
