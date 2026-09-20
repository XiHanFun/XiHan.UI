const n=`<!-- 间距 | 设置列与项目之间的间距 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const items = [
  { id: 1, tone: "brand", height: "48px" },
  { id: 2, tone: "info", height: "58px" },
  { id: 3, tone: "success", height: "68px" },
  { id: 4, tone: "warning", height: "78px" },
] as const;
const gaps = ["sm", "lg"] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <div v-for="gap in gaps" :key="gap" style="inline-size: min(280px, 100%)">
      <div style="margin-block-end: 8px; color: var(--xh-fg-muted); font-size: 13px">{{ gap }}</div>
      <XhMasonry :columns="2" :gap="gap">
        <div
          v-for="item in items"
          :key="item.id"
          data-demo-block
          :data-tone="item.tone"
          :style="{ '--xh-demo-block-block-size': item.height, '--xh-demo-block-radius': 'var(--xh-shape-control)' }"
        />
      </XhMasonry>
    </div>
  </div>
</template>
`;export{n as default};
