const r=`<!-- 基础用法 | 提交并校验表单 -->
<script setup lang="ts">
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

function validate(values: Record<string, unknown>) {
  return {
    email: String(values.email ?? "").includes("@") ? "" : "邮箱要带一个 @",
    nickname: String(values.nickname ?? "").trim() ? "" : "昵称不能为空",
  };
}
<\/script>

<template>
  <XhFormRoot
    :default-values="{ email: '', nickname: '' }"
    :validate="validate"
    style="inline-size: 320px;"
  >
    <XhFormErrorSummary v-slot="{ errorCount }">
      <span>共 {{ errorCount }} 处需要修改</span>
      <XhFormErrorSummaryItem v-slot="{ error }" name="email">{{ error }}</XhFormErrorSummaryItem>
      <XhFormErrorSummaryItem v-slot="{ error }" name="nickname">{{ error }}</XhFormErrorSummaryItem>
    </XhFormErrorSummary>

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" name="email">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl>
          <input
            type="email"
            placeholder="you@example.com"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" name="nickname">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>昵称</XhFieldLabel>
        <XhFieldControl>
          <input
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </div>
  </XhFormRoot>
</template>
`;export{r as default};
