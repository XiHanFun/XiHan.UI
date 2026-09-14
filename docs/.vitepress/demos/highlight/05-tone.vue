<!-- 语气 | tone 决定命中片段用哪族颜色，没命中的文本不受影响 -->
<script setup lang="ts">
import { XhHighlight } from "@xihan-ui/vue";

const text = "曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。";
const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
</script>

<template>
  <p v-for="tone in tones" :key="tone" style="margin: 0 0 6px">
    <XhHighlight :text="text" keyword="组件" :tone="tone" />
  </p>
</template>
