<script setup lang="ts">
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhEditableRoot default-value="曦寒" placeholder="未填写">
    <XhEditableLabel>昵称</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger aria-label="编辑" />
      <XhEditableSubmitTrigger aria-label="确认" />
      <XhEditableCancelTrigger aria-label="取消" />
    </XhEditableControl>
  </XhEditableRoot>
</template>
