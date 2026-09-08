const r=`<!-- 边缘渐隐 | variant="fade" 让还滚得动的那一侧把内容淡出，滚到头即收；带宽跟着 size 走 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const rows = Array.from({ length: 18 }, (_, i) => \`第 \${i + 1} 行内容\`);
<\/script>

<template>
  <XhScrollAreaRoot
    variant="fade"
    size="lg"
    style="block-size: 180px; inline-size: 100%; max-inline-size: 320px"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 8px 12px">
        <p v-for="row in rows" :key="row" style="margin: 0; line-height: 28px">
          {{ row }}
        </p>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
`;export{r as default};
