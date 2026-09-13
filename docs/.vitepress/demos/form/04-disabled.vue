<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 状态 | 禁用与只读表单 -->
<script setup lang="ts">
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhFormRoot disabled :default-values="{ token: 'xh-0f2a' }" style="inline-size: 260px;">
    <XhFormFieldGroup v-slot="{ value, setValue }" name="token">
      <XhFieldRoot disabled>
        <XhFieldLabel>接入令牌</XhFieldLabel>
        <XhFieldControl>
          <input
            disabled
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldDescription>整表禁用</XhFieldDescription>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </div>
  </XhFormRoot>

  <XhFormRoot
    read-only
    :default-values="{ token: 'xh-0f2a' }"
    style="inline-size: 260px;"
  >
    <XhFormFieldGroup v-slot="{ value, setValue }" name="token">
      <XhFieldRoot>
        <XhFieldLabel>接入令牌</XhFieldLabel>
        <XhFieldControl>
          <input
            readonly
            :value="value"
            @input="setValue(($event.target as HTMLInputElement).value)"
          >
        </XhFieldControl>
        <XhFieldDescription>只读：能提交，改不动</XhFieldDescription>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <div style="display: flex; gap: 8px;">
      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <XhFormResetTrigger>重置</XhFormResetTrigger>
    </div>
  </XhFormRoot>
</template>
