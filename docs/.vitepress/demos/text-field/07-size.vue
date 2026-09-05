<!-- 尺寸 | size 只改高度、内边距与字号，标签与清空按钮一起跟着换档；不写就是缺省档 -->
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
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot variant="outline" default-value="缺省" clearable>
    <XhTextFieldLabel>缺省</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot variant="outline" size="lg" default-value="大" clearable>
    <XhTextFieldLabel>lg</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
