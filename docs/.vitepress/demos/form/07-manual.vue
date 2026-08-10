<!-- 跨字段规则与手动入口 | validate 拿到的是整张值表，可以写两个字段互相约束的规则；插槽里的 setFieldError 与 clearErrors 随时能单独动一条 -->
<script setup lang="ts">
import {
  XhButton,
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

// 确认密码这一条要跟密码比，单看自己判不出来
function confirmError(values: Record<string, unknown>) {
  const password = String(values.password ?? "");
  const confirm = String(values.confirm ?? "");
  if (confirm === "")
    return "请再输入一遍密码";
  return confirm === password ? "" : "两次输入不一致";
}

function validate(values: Record<string, unknown>) {
  return {
    password: String(values.password ?? "").length >= 8 ? "" : "密码至少 8 位",
    confirm: confirmError(values),
  };
}
</script>

<template>
  <XhFormRoot
    v-slot="{ values, setFieldError, clearErrors }"
    :default-values="{ password: '', confirm: '' }"
    :validate="validate"
    style="inline-size: 320px;"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="password">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>密码</XhFieldLabel>
        <XhFieldControl>
          <input
            type="password"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          />
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="confirm">
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>确认密码</XhFieldLabel>
        <XhFieldControl>
          <input
            type="password"
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          />
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <!-- 只动确认密码这一条：给文案就写上，给空串就撤掉 -->
      <XhButton variant="outline" @click="setFieldError('confirm', confirmError(values))">
        只查确认密码
      </XhButton>
      <XhButton variant="ghost" @click="clearErrors()">清空错误</XhButton>
    </div>
  </XhFormRoot>
</template>
