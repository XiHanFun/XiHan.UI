<!-- 受控 | 值与明暗都能受控：传了就由宿主说了算，组件只把意图报出来，写不写回由宿主定 -->
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const password = ref("hunter2");
const revealed = ref(false);
</script>

<template>
  <XhPasswordInputRoot v-model:value="password" v-model:revealed="revealed">
    <XhPasswordInputLabel>密码</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 200px" />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
  <span>当前：{{ revealed ? password : "•".repeat(password.length) }}</span>
  <button type="button" @click="revealed = false">收起明文</button>
</template>
