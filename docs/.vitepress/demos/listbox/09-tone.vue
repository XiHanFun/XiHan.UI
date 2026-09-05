<!-- 语气 | tone 决定选中条目的勾选标记用哪族颜色，未选中的条目不受影响 -->
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "london", label: "London 伦敦" },
];
const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
</script>

<template>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
    <XhListboxRoot
      v-for="tone in tones"
      :key="tone"
      :tone="tone"
      :collection="cities"
      :default-value="['beijing']"
      :label="tone"
    />
  </div>
</template>
