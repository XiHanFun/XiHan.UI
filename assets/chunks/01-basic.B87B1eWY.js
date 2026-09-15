const e=`<!-- 基础用法 | 加减按钮与输入框共用一份状态；值是原始输入串，不传 value 即为非受控 -->
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhNumberFieldRoot default-value="1024" :min="0" name="width">
    <XhNumberFieldLabel>宽度</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
</template>
`;export{e as default};
