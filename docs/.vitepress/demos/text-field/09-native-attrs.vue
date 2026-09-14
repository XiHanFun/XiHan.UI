<!-- 原生属性 | 写在 input 部件上的属性直接落到真正的输入框，自动填充与移动端键盘类型由它们决定 -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot placeholder="you@example.com">
    <XhTextFieldLabel>邮箱</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 220px">
      <XhTextFieldInput
        autocomplete="email"
        inputmode="email"
        spellcheck="false"
      />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="11 位手机号" :max-length="11">
    <XhTextFieldLabel>手机号</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 220px">
      <XhTextFieldInput
        autocomplete="tel"
        inputmode="numeric"
        enterkeyhint="done"
      />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
