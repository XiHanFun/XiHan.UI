<!-- 无效态 | invalid 一翻，错误文案接进描述链并显出；它带 role=alert，翻转那一刻读屏立即播报 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhFieldsetErrorText,
  XhFieldsetHelperText,
  XhFieldsetLegend,
  XhFieldsetRoot,
} from "@xihan-ui/vue";

const email = ref("");
const phone = ref("");
// 整组的校验结论由宿主判定，字段集只负责把它铺成属性
const invalid = computed(() => email.value === "" && phone.value === "");
</script>

<template>
  <XhFieldsetRoot :invalid="invalid" style="inline-size: 320px;">
    <XhFieldsetLegend>联系方式</XhFieldsetLegend>
    <input v-model="email" type="email" placeholder="邮箱" style="inline-size: 100%;" />
    <input v-model="phone" type="tel" placeholder="手机号" style="inline-size: 100%;" />
    <XhFieldsetHelperText>两者填一个即可</XhFieldsetHelperText>
    <XhFieldsetErrorText>请至少填写一种联系方式</XhFieldsetErrorText>
  </XhFieldsetRoot>
</template>
