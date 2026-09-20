const n=`<!-- 受控 | 值与明暗都可受控：传入后由宿主决定，组件只报告意图，是否写回由宿主决定 -->
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
<\/script>

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
`;export{n as default};
