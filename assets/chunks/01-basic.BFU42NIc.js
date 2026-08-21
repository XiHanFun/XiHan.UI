const e=`<!-- 基础用法 | root 持有状态，label 与 input 各自向它取属性；不传 value 即为非受控，组件自己维护值 -->
<script setup lang="ts">
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhTextFieldRoot placeholder="请输入昵称">
    <XhTextFieldLabel>昵称</XhTextFieldLabel>
    <XhTextFieldInput style="inline-size: 200px" />
  </XhTextFieldRoot>

  <XhTextFieldRoot default-value="曦寒">
    <XhTextFieldLabel>带初值</XhTextFieldLabel>
    <XhTextFieldInput style="inline-size: 200px" />
  </XhTextFieldRoot>
</template>
`;export{e as default};
