const r=`<!-- 双轴与拐角 | 两条轴各写一条滚动条，corner 补上右下角那块空白；内容要比视口宽，横轴才量得出溢出 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaCorner,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const rows = Array.from(
  { length: 16 },
  (_, i) => \`第 \${i + 1} 行 —— 这一行故意写得很长，长到横向也需要滚动才看得完整句话\`
);
<\/script>

<template>
  <XhScrollAreaRoot
    type="always"
    style="block-size: 160px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 8px 12px">
        <p
          v-for="row in rows"
          :key="row"
          style="margin: 0; line-height: 24px; white-space: nowrap"
        >
          {{ row }}
        </p>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaThumb />
    </XhScrollAreaScrollbar>
    <XhScrollAreaScrollbar orientation="horizontal">
      <XhScrollAreaThumb />
    </XhScrollAreaScrollbar>
    <XhScrollAreaCorner />
  </XhScrollAreaRoot>
</template>
`;export{r as default};
