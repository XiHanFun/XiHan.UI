<!-- 受控 | 传入 value 后由宿主决定，组件自身不再修改状态；变化经 value-change 报告，是否写回由宿主决定 -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const nickname = ref("曦寒");
</script>

<template>
  <XhTextFieldRoot v-model:value="nickname" placeholder="请输入昵称">
    <XhTextFieldLabel>昵称</XhTextFieldLabel>
    <XhTextFieldControl>
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
  <span>当前：{{ nickname || "（空）" }}</span>
  <button type="button" @click="nickname = '曦寒'">重置</button>
</template>
