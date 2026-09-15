const o=`<!-- 换成自绘滚动条 | 视口给个 id，用滚动条的 controls 挂上去；条子浮在内容之上，不占宽度也不留空道 -->
<script setup lang="ts">
import {
  XhLogContent,
  XhLogLine,
  XhLogRoot,
  XhLogViewport,
  XhScrollbarRoot,
  XhScrollbarThumb,
  XhScrollbarTrack,
} from "@xihan-ui/vue";

const lines = Array.from(
  { length: 40 },
  (_, i) => \`12:0\${Math.floor(i / 10)}:\${String(i % 60).padStart(2, "0")}  http     GET  /api/orders/\${8800 + i}   200   \${10 + i}ms\`,
);
<\/script>

<template>
  <XhLogRoot :rows="8" style="inline-size: 100%">
    <XhLogViewport id="log-scrollbar-viewport">
      <XhLogContent>
        <XhLogLine v-for="(line, i) in lines" :key="i">{{ line }}</XhLogLine>
      </XhLogContent>
    </XhLogViewport>
    <!-- 滚动条不必是滚动容器的后代，这里与视口平级摆在日志根里 -->
    <XhScrollbarRoot controls="log-scrollbar-viewport">
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </XhLogRoot>
</template>
`;export{o as default};
