<!-- 受控 | 值与明暗都能受控：传了就由宿主说了算，组件只把意图报出来，写不写回由宿主定 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";

const password = ref("hunter2");
const visible = ref(false);
</script>

<template>
  <XhPasswordInputRoot v-model:value="password" v-model:visible="visible">
    <XhPasswordInputLabel>密码</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 200px" />
      <!-- 图标随宿主那份状态换，切换钮自己的名字由组件管 -->
      <XhPasswordInputVisibilityTrigger>{{ visible ? "◉" : "○" }}</XhPasswordInputVisibilityTrigger>
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
  <span>当前：{{ visible ? password : "•".repeat(password.length) }}</span>
  <button type="button" @click="visible = false">收起明文</button>
</template>
