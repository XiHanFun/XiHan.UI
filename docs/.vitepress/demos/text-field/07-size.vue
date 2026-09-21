<!-- 尺寸 | size 只改变高度、内边距与字号，标签与清空按钮一起换档；不写即默认档 -->
<script setup lang="ts">
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 固定 outline 形态，只看档位的差别 -->
  <XhTextFieldRoot variant="outline" size="sm" default-value="小" clearable>
    <XhTextFieldLabel>sm</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot variant="outline" default-value="缺省" clearable>
    <XhTextFieldLabel>缺省</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot variant="outline" size="lg" default-value="大" clearable>
    <XhTextFieldLabel>lg</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
