const n=`<!-- 表单 | 给了 name 才带上隐藏输入参与提交；宿主表单点重置，选中值回落到 default-value -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSegmentedRoot } from "@xihan-ui/vue";

const submitted = ref("");
const channels = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
];

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement);
  submitted.value = String(data.get("channel") ?? "");
}
<\/script>

<template>
  <form
    style="display: flex; gap: 12px; align-items: center"
    @submit.prevent="onSubmit"
  >
    <XhSegmentedRoot
      :collection="channels"
      name="channel"
      default-value="email"
      aria-label="通知渠道"
    />
    <button type="submit">提交</button>
    <button type="reset">重置</button>
    <span>已提交：{{ submitted || "（还没提交）" }}</span>
  </form>
</template>
`;export{n as default};
