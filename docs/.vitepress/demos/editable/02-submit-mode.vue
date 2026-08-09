<!-- 提交方式 | submitMode 决定编辑态怎么收尾，不算提交的那些出口一律按撤销处理，值还回上一次提交的那个 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhEditableArea,
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/vue";

const blurCommitted = ref("失焦即提交");
const enterCommitted = ref("回车才提交");
</script>

<template>
  <XhEditableRoot
    default-value="失焦即提交"
    placeholder="未填写"
    submit-mode="blur"
    @value-commit="blurCommitted = $event.value"
  >
    <XhEditableLabel>submitMode = blur</XhEditableLabel>
    <XhEditableArea>
      <XhEditablePreview />
      <XhEditableInput />
    </XhEditableArea>
    <XhEditableControl>
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
      <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
    </XhEditableControl>
    <span>上次提交：{{ blurCommitted || "（空）" }}</span>
  </XhEditableRoot>

  <XhEditableRoot
    default-value="回车才提交"
    placeholder="未填写"
    submit-mode="enter"
    @value-commit="enterCommitted = $event.value"
  >
    <XhEditableLabel>submitMode = enter</XhEditableLabel>
    <XhEditableArea>
      <XhEditablePreview />
      <XhEditableInput />
    </XhEditableArea>
    <XhEditableControl>
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
      <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
    </XhEditableControl>
    <span>上次提交：{{ enterCommitted || "（空）" }}</span>
  </XhEditableRoot>
</template>
