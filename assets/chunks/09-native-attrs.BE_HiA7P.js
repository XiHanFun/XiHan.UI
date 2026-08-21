const e=`<!-- 原生属性 | 写在 input 部件上的属性直接落到真正的输入框，自动填充与移动端键盘类型由它们决定 -->
<script setup lang="ts">
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhTextFieldRoot placeholder="you@example.com">
    <XhTextFieldLabel>邮箱</XhTextFieldLabel>
    <XhTextFieldInput
      style="inline-size: 220px"
      autocomplete="email"
      inputmode="email"
      spellcheck="false"
    />
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="11 位手机号" :max-length="11">
    <XhTextFieldLabel>手机号</XhTextFieldLabel>
    <XhTextFieldInput
      style="inline-size: 220px"
      autocomplete="tel"
      inputmode="numeric"
      enterkeyhint="done"
    />
  </XhTextFieldRoot>
</template>
`;export{e as default};
