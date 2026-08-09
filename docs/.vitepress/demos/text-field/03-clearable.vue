<!-- 可清空与字数上限 | clearable 让清空按钮可用并把 Escape 接管过来，maxLength 同时落成原生 maxlength 与机器侧截断 -->
<script setup lang="ts">
import {
  XhTextFieldClearTrigger,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot
    v-slot="{ value, atLimit }"
    default-value="曦寒"
    placeholder="最多 10 个字符"
    :max-length="10"
    clearable
  >
    <XhTextFieldLabel>昵称</XhTextFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhTextFieldInput style="inline-size: 200px" />
      <XhTextFieldClearTrigger>✕</XhTextFieldClearTrigger>
    </div>
    <span>{{ value.length }} / 10{{ atLimit ? "（已到上限）" : "" }}</span>
  </XhTextFieldRoot>
</template>
