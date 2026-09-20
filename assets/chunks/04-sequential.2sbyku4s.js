const n=`<!-- 顺序排列 | 按文档顺序逐列填充 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const steps = [
  { id: 1, tone: "brand", height: "56px" },
  { id: 2, tone: "info", height: "72px" },
  { id: 3, tone: "success", height: "88px" },
  { id: 4, tone: "warning", height: "56px" },
  { id: 5, tone: "danger", height: "72px" },
  { id: 6, tone: "neutral", height: "88px" },
] as const;
<\/script>

<template>
  <XhMasonry :columns="3" gap="sm" sequential style="inline-size: min(640px, 100%)">
    <div
      v-for="step in steps"
      :key="step.id"
      data-demo-block
      :data-tone="step.tone"
      :style="{ '--xh-demo-block-block-size': step.height }"
    />
  </XhMasonry>
</template>
`;export{n as default};
