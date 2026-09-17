<!-- 语气 | tone 决定勾中后方框使用哪族颜色，因此这里都设为勾中 -->
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
    <XhCheckbox v-for="t in tones" :key="t" :tone="t" default-checked>{{ t }}</XhCheckbox>
  </div>
</template>
