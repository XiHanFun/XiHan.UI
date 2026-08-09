<!-- 禁用 | 单项禁用后点不动，方向键也跳过它；整组禁用则每一项都跟着禁用 -->
<script setup lang="ts">
import {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhRadioGroupRoot default-value="free">
    <XhRadioGroupLabel>单项禁用</XhRadioGroupLabel>
    <XhRadioGroupItem value="free">
      <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
    </XhRadioGroupItem>
    <XhRadioGroupItem value="pro" disabled>
      <XhRadioGroupItemText>专业版</XhRadioGroupItemText>
    </XhRadioGroupItem>
  </XhRadioGroupRoot>

  <XhRadioGroupRoot default-value="free" disabled>
    <XhRadioGroupLabel>整组禁用</XhRadioGroupLabel>
    <XhRadioGroupItem value="free">
      <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
    </XhRadioGroupItem>
    <XhRadioGroupItem value="pro">
      <XhRadioGroupItemText>专业版</XhRadioGroupItemText>
    </XhRadioGroupItem>
  </XhRadioGroupRoot>
</template>
