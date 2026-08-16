<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别 -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhNumberFieldRoot v-for="t in tones" :key="t" variant="outline" :tone="t" default-value="1">
      <XhNumberFieldLabel>{{ t }}</XhNumberFieldLabel>
      <XhNumberFieldControl>
        <XhNumberFieldInput style="inline-size: 72px; text-align: center" />
        <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
        <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
      </XhNumberFieldControl>
    </XhNumberFieldRoot>
  </div>
</template>
