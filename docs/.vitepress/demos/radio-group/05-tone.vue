<!-- 语气 | tone 决定选中圆点用哪族颜色，六种语气各一组 -->
<script setup lang="ts">
import {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRadioGroupRoot v-for="t in tones" :key="t" :tone="t" default-value="yes">
      <XhRadioGroupLabel>{{ t }}</XhRadioGroupLabel>
      <XhRadioGroupItem value="yes">
        <XhRadioGroupItemText>选中</XhRadioGroupItemText>
      </XhRadioGroupItem>
      <XhRadioGroupItem value="no">
        <XhRadioGroupItemText>未选</XhRadioGroupItemText>
      </XhRadioGroupItem>
    </XhRadioGroupRoot>
  </div>
</template>
