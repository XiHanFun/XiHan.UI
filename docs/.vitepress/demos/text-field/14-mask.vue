<!-- 掩码 | mask 把输入排成固定格式：9 收数字、a 收字母，分隔符按到那一位时自动补上；值含分隔符，value-change 另带去掉分隔符的 unmaskedValue -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const digits = ref("");
</script>

<template>
  <XhTextFieldRoot
    name="phone"
    mask="999 9999 9999"
    placeholder="138 0000 0000"
    @value-change="(details) => (digits = details.unmaskedValue ?? '')"
  >
    <XhTextFieldLabel>手机号</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
  <span data-demo-output>去掉分隔符：{{ digits || "（未输入）" }}</span>
</template>
