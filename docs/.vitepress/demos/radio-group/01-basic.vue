<!-- 基础用法 | 组内只有一个 Tab 停靠点，进组后四个方向键都能切换，隐藏输入与选中圆点由条目自行装配 -->
<script setup lang="ts">
import {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhRadioGroupRoot default-value="standard" name="plan">
    <XhRadioGroupLabel>套餐</XhRadioGroupLabel>
    <XhRadioGroupItem value="free">
      <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
    </XhRadioGroupItem>
    <XhRadioGroupItem value="standard">
      <XhRadioGroupItemText>标准版</XhRadioGroupItemText>
    </XhRadioGroupItem>
    <XhRadioGroupItem value="pro">
      <XhRadioGroupItemText>专业版</XhRadioGroupItemText>
    </XhRadioGroupItem>
  </XhRadioGroupRoot>
</template>
