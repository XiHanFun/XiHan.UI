var e=`<!-- 无效态 | invalid 切换后，错误文案接入描述链并显示；它带 role=alert，切换时读屏立即播报 -->
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFieldsetDescription,
  XhFieldsetErrorText,
  XhFieldsetLegend,
  XhFieldsetRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const email = ref("");
const phone = ref("");
// 整组的校验结论由宿主判定，字段集只负责把它铺成属性
const invalid = computed(() => email.value === "" && phone.value === "");
<\/script>

<template>
  <XhFieldsetRoot :invalid="invalid" style="inline-size: 320px;">
    <XhFieldsetLegend>联系方式</XhFieldsetLegend>
    <XhFieldRoot>
      <XhFieldLabel>邮箱</XhFieldLabel>
      <XhFieldControl>
        <input v-model="email" type="email">
      </XhFieldControl>
    </XhFieldRoot>
    <XhFieldRoot>
      <XhFieldLabel>手机号</XhFieldLabel>
      <XhFieldControl>
        <input v-model="phone" type="tel">
      </XhFieldControl>
    </XhFieldRoot>
    <XhFieldsetDescription>两者填一个即可</XhFieldsetDescription>
    <XhFieldsetErrorText>请至少填写一种联系方式</XhFieldsetErrorText>
  </XhFieldsetRoot>
</template>
`;export{e as default};