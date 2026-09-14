<!-- 禁用与校验态 | disabled 与 readOnly 都改不动值，invalid 只把 aria-invalid 标出来、不拦输入 -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot default-value="改不动" disabled>
    <XhTextFieldLabel>禁用</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 160px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot default-value="只能看" read-only>
    <XhTextFieldLabel>只读</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 160px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot default-value="格式不对" invalid>
    <XhTextFieldLabel>校验失败</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 160px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
