<!-- 基础用法 | root 持有状态，label 与 control 里的 input 各自向它取属性；不传 value 即为非受控，组件自己维护值 -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldClearTrigger,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot name="email" type="email" placeholder="输入你的邮箱" clearable>
    <XhTextFieldLabel>邮箱</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 16rem">
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
