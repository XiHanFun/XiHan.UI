<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，语气的底色差别不必聚焦就看得见 -->
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <!-- 框里的字不归语气管，语气只落在底色、悬停描边与聚焦描边上；聚焦环恒用同一族色 -->
  <XhPasswordInputRoot
    v-for="t in tones"
    :key="t"
    variant="subtle"
    :tone="t"
    default-value="hunter2"
  >
    <XhPasswordInputLabel>{{ t }}</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 160px" />
      <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
