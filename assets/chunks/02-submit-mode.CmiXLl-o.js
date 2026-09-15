const e=`<!-- 提交方式 | 使用失焦或回车提交 -->
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
<\/script>

<template>
  <XhEditableRoot
    default-value="失焦即提交"
    placeholder="未填写"
    submit-mode="blur"
  >
    <XhEditableLabel>submitMode = blur</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger aria-label="编辑" />
      <XhEditableSubmitTrigger aria-label="确认" />
      <XhEditableCancelTrigger aria-label="取消" />
    </XhEditableControl>
  </XhEditableRoot>

  <XhEditableRoot
    default-value="回车才提交"
    placeholder="未填写"
    submit-mode="enter"
  >
    <XhEditableLabel>submitMode = enter</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger aria-label="编辑" />
      <XhEditableSubmitTrigger aria-label="确认" />
      <XhEditableCancelTrigger aria-label="取消" />
    </XhEditableControl>
  </XhEditableRoot>
</template>
`;export{e as default};
