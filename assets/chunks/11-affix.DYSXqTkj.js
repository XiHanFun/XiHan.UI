var e=`<!-- 框内前后缀 | 前后缀与输入框同在 control 这一个框里排成一行，共用它的描边与底色 -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldPrefix,
  XhTextFieldRoot,
  XhTextFieldSuffix,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhTextFieldRoot placeholder="0.00">
    <XhTextFieldLabel>金额</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldPrefix>¥</XhTextFieldPrefix>
      <XhTextFieldInput inputmode="decimal" />
      <XhTextFieldSuffix>元</XhTextFieldSuffix>
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="170">
    <XhTextFieldLabel>身高</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldInput inputmode="numeric" />
      <XhTextFieldSuffix>cm</XhTextFieldSuffix>
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
`;export{e as default};