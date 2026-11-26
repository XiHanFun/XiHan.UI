<!-- 随表单提交 | 写了 name 才带表单出口：选中值按逗号拼成一串随表单提交，required 时一枚都没选就拦下 -->
<script setup lang="ts">
import { XhButton, XhTagGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const submitted = ref("");
const topics = [
  { value: "design", label: "设计" },
  { value: "a11y", label: "无障碍" },
  { value: "motion", label: "动效" },
];

function onSubmit(event: Event) {
  submitted.value = String(new FormData(event.target as HTMLFormElement).get("topics") ?? "");
}
</script>

<template>
  <form
    style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 420px"
    @submit.prevent="onSubmit"
  >
    <XhTagGroupRoot
      :collection="topics"
      :default-value="['design']"
      label="关注的话题"
      name="topics"
      selection-mode="multiple"
      required
    />
    <XhButton type="submit" variant="outline" style="align-self: start">提交</XhButton>
    <span data-demo-output>表单收到：{{ submitted || "（还没提交）" }}</span>
  </form>
</template>
