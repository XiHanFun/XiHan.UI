<!-- 无效与必填 | invalid 一翻，错误文案接入描述链并显出，控件上同时落 aria-invalid；required 只落 aria-required，校验仍归宿主 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/vue";

const email = ref("zhaifanhua");
// 无效与否由宿主判定，Field 只负责把这个结论铺成属性
const invalid = computed(() => email.value !== "" && !email.value.includes("@"));
</script>

<template>
  <XhFieldRoot :invalid="invalid" required style="inline-size: 280px;">
    <XhFieldLabel>邮箱</XhFieldLabel>
    <XhFieldControl>
      <input v-model="email" type="email" placeholder="you@example.com" />
    </XhFieldControl>
    <XhFieldDescription>用于接收账单与安全提醒</XhFieldDescription>
    <!-- 错误文案带 role=alert，翻转的那一刻读屏立即播报 -->
    <XhFieldErrorText>邮箱格式不正确</XhFieldErrorText>
  </XhFieldRoot>
</template>
