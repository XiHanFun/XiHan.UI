<!-- 横向排布 | orientation 只影响排版与 aria-orientation，方向键四个方向照样都能切换 -->
<script setup lang="ts">
import {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhRadioGroupRoot default-value="md" orientation="horizontal">
    <XhRadioGroupLabel>尺寸</XhRadioGroupLabel>
    <XhRadioGroupItem value="sm">
      <XhRadioGroupItemText>小</XhRadioGroupItemText>
    </XhRadioGroupItem>
    <XhRadioGroupItem value="md">
      <XhRadioGroupItemText>中</XhRadioGroupItemText>
    </XhRadioGroupItem>
    <XhRadioGroupItem value="lg">
      <XhRadioGroupItemText>大</XhRadioGroupItemText>
    </XhRadioGroupItem>
  </XhRadioGroupRoot>
</template>
