const n=`<!-- 语气 | tone 决定两端取哪族颜色；写了 from / to 就由它们说了算，tone 让位 -->
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
<\/script>

<template>
  <p v-for="tone in tones" :key="tone" style="margin: 0 0 8px; font-size: 28px; font-weight: 700">
    <XhGradientText :tone="tone">曦寒前端组件库 · {{ tone }}</XhGradientText>
  </p>
</template>
`;export{n as default};
