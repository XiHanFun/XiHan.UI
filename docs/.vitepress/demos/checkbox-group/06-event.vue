<!-- 受控与拦截 | 传了 value 就由宿主说了算，value-change 只报意图；这里最多留两项 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const picked = ref<string[]>(["email"]);
const rejected = ref(false);
const channels = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
  { value: "webhook", label: "回调" },
];

// 超过两项就不写回，界面停在原值
function onValueChange(details: { value: string[] }) {
  rejected.value = details.value.length > 2;
  if (!rejected.value) picked.value = details.value;
}
</script>

<template>
  <XhCheckboxGroupRoot
    :value="picked"
    :collection="channels"
    label="通知渠道（最多两项）"
    orientation="horizontal"
    @value-change="onValueChange"
  />
  <p>已选：{{ picked.join("、") || "（无）" }}{{ rejected ? " · 上一次超额，未写回" : "" }}</p>
</template>
