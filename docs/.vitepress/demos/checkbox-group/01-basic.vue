<!-- 基础用法 | 从一组选项中选择任意多项 -->
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送通知" },
];
</script>

<template>
  <XhCheckboxGroupRoot
    :collection="items"
    :default-value="['email']"
    label="通知方式"
    name="notification"
  />
</template>
