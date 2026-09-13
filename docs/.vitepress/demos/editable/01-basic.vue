<!-- 基础用法 | 点击文本就地编辑 -->
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
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
      <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
    </XhEditableControl>
  </XhEditableRoot>
</template>
