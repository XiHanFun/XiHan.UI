<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别 -->
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px">
    <XhPinInputRoot
      v-for="t in tones"
      :key="t"
      variant="outline"
      :tone="t"
      :length="4"
      placeholder="·"
    >
      <XhPinInputLabel>{{ t }}</XhPinInputLabel>
      <div style="display: flex">
        <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
      </div>
    </XhPinInputRoot>
  </div>
</template>
