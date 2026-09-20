const n=`<!-- 边缘渐隐 | 提示还有更多内容 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const tones = ["brand", "info", "success", "warning", "danger", "neutral"] as const;
const rows = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, tone: tones[index % tones.length], width: \`\${56 + (index % 4) * 8}%\` }));
<\/script>

<template>
  <XhScrollAreaRoot
    variant="fade"
    size="lg"
    style="block-size: 180px; inline-size: min(320px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 12px 16px">
        <span v-for="row in rows" :key="row.id" data-demo-block="line" :data-tone="row.tone" :style="{ '--xh-demo-block-inline-size': row.width, 'marginBlock': '15px' }" />
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
