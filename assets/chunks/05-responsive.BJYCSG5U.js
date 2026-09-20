const n=`<!-- 响应式列 | 在不同视口使用不同列数 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const sections = [
  { id: 1, tone: "brand" },
  { id: 2, tone: "info" },
  { id: 3, tone: "success" },
  { id: 4, tone: "warning" },
] as const;
<\/script>

<template>
  <XhGridRoot :cols="{ base: 1, sm: 2, lg: 4 }" gap="sm" style="inline-size: min(720px, 100%)">
    <XhGridItem
      v-for="section in sections"
      :key="section.id"
      data-demo-block
      :data-tone="section.tone"
    />
  </XhGridRoot>
</template>
`;export{n as default};
