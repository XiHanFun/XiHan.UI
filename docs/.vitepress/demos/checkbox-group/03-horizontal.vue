<!-- 横向排布 | orientation 只出 data-orientation 交给皮肤排版，role=group 不接受 aria-orientation -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCheckboxGroupItem,
  XhCheckboxGroupItemControl,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from "@xihan-ui/vue";

const channels = ref<string[]>(["email"]);
const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
];
</script>

<template>
  <XhCheckboxGroupRoot v-model:value="channels" orientation="horizontal">
    <XhCheckboxGroupLabel>通知渠道</XhCheckboxGroupLabel>
    <XhCheckboxGroupItem v-for="c in items" :key="c.value" :value="c.value">
      <XhCheckboxGroupItemControl />
      <XhCheckboxGroupItemText>{{ c.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>
</template>
