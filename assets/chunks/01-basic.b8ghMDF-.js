const n=`<!-- 基础用法 | 按最短列排列卡片 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cards = [
  { id: 1, tone: "brand", height: "88px" },
  { id: 2, tone: "info", height: "136px" },
  { id: 3, tone: "success", height: "104px" },
  { id: 4, tone: "warning", height: "128px" },
  { id: 5, tone: "danger", height: "80px" },
  { id: 6, tone: "neutral", height: "116px" },
] as const;
<\/script>

<template>
  <XhMasonry :columns="3" gap="md" aria-label="瀑布流占位区块" style="inline-size: min(680px, 100%)">
    <article
      v-for="card in cards"
      :key="card.id"
      data-demo-block
      :data-tone="card.tone"
      :style="{ '--xh-demo-block-block-size': card.height }"
    />
  </XhMasonry>
</template>
`;export{n as default};
