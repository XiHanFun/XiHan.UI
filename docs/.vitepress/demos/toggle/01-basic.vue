<!-- 基础用法 | 按下态由 pressed 表达，非受控时组件自己维护 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhToggle } from "@xihan-ui/vue";

const bold = ref(false);
</script>

<template>
  <XhToggle>加粗</XhToggle>
  <XhToggle v-model:pressed="bold">受控：{{ bold ? "已按下" : "未按下" }}</XhToggle>
</template>
