<!-- 基础用法 | 默认只在提交时整表校验：过了发 submit，没过发 invalid、摘要显形并把焦点送到第一个出错的字段 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormErrorSummary,
  XhFormErrorSummaryItem,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

const submitted = ref("");

// 校验整表跑一遍，返回「字段名 → 错误文案」；空串表示这条没错
function validate(values: Record<string, unknown>) {
  return {
    email: String(values.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
    nickname: String(values.nickname ?? "").trim() ? "" : "昵称不能为空",
  };
}

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = JSON.stringify(details.values);
}
</script>

<template>
  <XhFormRoot
    :default-values="{ email: '', nickname: '' }"
    :validate="validate"
    style="inline-size: 320px;"
    @submit="onSubmit"
  >
    <!-- 摘要只在提交失败后显形；条目一次全写上，谁露面由当下的错误表决定 -->
    <XhFormErrorSummary v-slot="{ errorCount }">
      <span>共 {{ errorCount }} 处需要修改</span>
      <XhFormErrorSummaryItem v-slot="{ error }" value="email">{{ error }}</XhFormErrorSummaryItem>
      <XhFormErrorSummaryItem v-slot="{ error }" value="nickname">{{ error }}</XhFormErrorSummaryItem>
    </XhFormErrorSummary>

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="email">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl>
          <input
            type="email"
            placeholder="you@example.com"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          />
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="nickname">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>昵称</XhFieldLabel>
        <XhFieldControl>
          <input
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          />
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </div>

    <p v-if="submitted" style="margin: 0; font-size: 13px;">已提交：{{ submitted }}</p>
  </XhFormRoot>
</template>
