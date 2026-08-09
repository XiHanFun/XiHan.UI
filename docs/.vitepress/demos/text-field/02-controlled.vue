<!-- 受控 | 传了 value 就由宿主说了算，组件自己不再改状态；v-model:value 是它的语法糖 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";

const nickname = ref("曦寒");
</script>

<template>
  <XhTextFieldRoot v-model:value="nickname" placeholder="请输入昵称">
    <XhTextFieldLabel>昵称</XhTextFieldLabel>
    <XhTextFieldInput style="inline-size: 200px" />
  </XhTextFieldRoot>
  <span>当前：{{ nickname || "（空）" }}</span>
  <button type="button" @click="nickname = '曦寒'">重置</button>
</template>
