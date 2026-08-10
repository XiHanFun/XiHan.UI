<!-- 横向排布 | orientation 只出 data-orientation 交给皮肤排版，role=group 不接受 aria-orientation -->
<script setup lang="ts">
import { ref } from "vue";
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const channels = ref<string[]>(["email"]);
const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
];
</script>

<template>
  <XhCheckboxGroupRoot
    v-model:value="channels"
    :collection="items"
    label="通知渠道"
    orientation="horizontal"
  />
</template>
