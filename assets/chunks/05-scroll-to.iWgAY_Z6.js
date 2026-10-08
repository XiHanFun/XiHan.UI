var e=`<!-- 命令式滚动与到底通知 | scrollTo 滚动视口，reach-end 在滚到底那一下通知一次，常用来提示或续载 -->
<script setup lang="ts">
import type { ScrollAreaScrollDetails } from "@xihan-ui/headless";
import {
  XhButton,
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const rows = Array.from({ length: 20 }, (_, i) => \`第 \${i + 1} 条记录\`);
const status = ref("往下滚到底看看");

function onReachEnd(details: ScrollAreaScrollDetails): void {
  if (details.orientation === "vertical")
    status.value = "已经到底了";
}
<\/script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start; inline-size: min(360px, 100%)">
    <XhScrollAreaRoot
      v-slot="{ scrollTo }"
      type="always"
      aria-label="记录列表"
      style="block-size: 180px; inline-size: 100%; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
      @reach-end="onReachEnd"
    >
      <XhScrollAreaViewport>
        <XhScrollAreaContent style="padding: 8px 16px">
          <p v-for="row in rows" :key="row" style="margin: 8px 0">{{ row }}</p>
        </XhScrollAreaContent>
      </XhScrollAreaViewport>
      <XhScrollAreaScrollbar orientation="vertical">
        <XhScrollAreaTrack>
          <XhScrollAreaThumb />
        </XhScrollAreaTrack>
      </XhScrollAreaScrollbar>
      <div style="position: absolute; inset-block-end: 8px; inset-inline-end: 20px">
        <XhButton size="sm" variant="outline" @click="scrollTo({ top: 0, behavior: 'smooth' }); status = '往下滚到底看看'">
          回到顶部
        </XhButton>
      </div>
    </XhScrollAreaRoot>
    <span aria-live="polite">{{ status }}</span>
  </div>
</template>
`;export{e as default};