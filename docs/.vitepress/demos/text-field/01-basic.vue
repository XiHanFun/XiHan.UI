<!-- 基础用法 | root 持有状态，label 与 control 里的 input 各自向它取属性；不传 value 即为非受控，组件自己维护值 -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot placeholder="请输入昵称">
    <XhTextFieldLabel>昵称</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot default-value="曦寒">
    <XhTextFieldLabel>带初值</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
