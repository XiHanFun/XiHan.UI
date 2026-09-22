const e=`<!-- 基础用法 | root 持有状态，label 与 control 中的 input 各自向它取属性；不传 value 即为非受控，组件自行维护值 -->
<script setup lang="ts">
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhTextFieldRoot name="email" type="email" placeholder="输入你的邮箱" clearable>
    <XhTextFieldLabel>邮箱</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldInput />
      <XhTextFieldClearTrigger />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
`;export{e as default};
