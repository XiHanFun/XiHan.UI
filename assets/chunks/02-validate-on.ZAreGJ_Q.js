const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 校验时机 | 在失焦或输入时校验 -->
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";

function validate(values: Record<string, unknown>) {
  const port = String(values.port ?? "").trim();
  return { port: /^\\d+$/.test(port) ? "" : "端口只能是数字" };
}
<\/script>

<template>
  <!-- 失焦时校验这一个字段：填的过程中不打断 -->
  <XhFormRoot
    :default-values="{ port: 'abc' }"
    :validate="validate"
    validate-on="blur"
    style="inline-size: 240px;"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" name="port">
      <XhFieldRoot :invalid="invalid">
        <XhFieldLabel>端口（失焦校验）</XhFieldLabel>
        <XhFieldControl>
          <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)">
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>
    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
  </XhFormRoot>

  <!-- 改一个字就校验一次：错误随输入实时消长 -->
  <XhFormRoot
    :default-values="{ port: 'abc' }"
    :validate="validate"
    validate-on="change"
    style="inline-size: 240px;"
  >
    <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" name="port">
      <XhFieldRoot :invalid="invalid">
        <XhFieldLabel>端口（改动即校验）</XhFieldLabel>
        <XhFieldControl>
          <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)">
        </XhFieldControl>
        <XhFieldErrorText>{{ error }}</XhFieldErrorText>
      </XhFieldRoot>
    </XhFormFieldGroup>
    <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
  </XhFormRoot>
</template>
`;export{e as default};
