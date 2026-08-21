const n=`<!-- 语气 | tone 决定选中态的底与描边用哪族颜色，所以这里都置为选中 -->
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
    <span v-for="t in tones" :key="t" style="display: inline-flex; align-items: center; gap: 6px">
      <XhCheckbox :tone="t" default-checked />
      <span>{{ t }}</span>
    </span>
  </div>
</template>
`;export{n as default};
