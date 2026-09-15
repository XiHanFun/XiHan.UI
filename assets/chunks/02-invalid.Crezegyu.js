const e=`<!-- 必填与校验 | 显示字段错误 -->
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const email = ref("zhaifanhua");
// 无效与否由宿主判定，Field 只负责把这个结论铺成属性
const invalid = computed(() => email.value !== "" && !email.value.includes("@"));
<\/script>

<template>
  <XhFieldRoot :invalid="invalid" required style="inline-size: 280px;">
    <XhFieldLabel>邮箱</XhFieldLabel>
    <XhFieldControl>
      <input v-model="email" type="email" placeholder="you@example.com">
    </XhFieldControl>
    <XhFieldDescription>用于接收账单与安全提醒</XhFieldDescription>
    <!-- 错误文案带 role=alert，翻转的那一刻读屏立即播报 -->
    <XhFieldErrorText>邮箱格式不正确</XhFieldErrorText>
  </XhFieldRoot>
</template>
`;export{e as default};
