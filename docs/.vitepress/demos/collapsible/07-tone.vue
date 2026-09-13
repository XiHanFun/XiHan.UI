<!-- 颜色 | tone 落在触发按钮的展开态上，六种颜色各展开一份做对照 -->
<script setup lang="ts">
import { XhCollapsibleContent, XhCollapsibleRoot, XhCollapsibleTrigger } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
</script>

<template>
  <div
    style="
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      align-items: start;
    "
  >
    <XhCollapsibleRoot v-for="tone in tones" :key="tone" :tone="tone" default-open>
      <XhCollapsibleTrigger>{{ tone }}</XhCollapsibleTrigger>
      <XhCollapsibleContent>收起后触发按钮保持默认颜色。</XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
