<!-- 禁用与空值 | disabled 罩住整框并走原生 disabled；输入为空或只有空白时发送按钮转灰，但位置留着不收起 -->
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 整框禁用：输入框带原生 disabled，提交与停止一并吃掉 -->
    <XhPromptInputRoot
      disabled
      default-value="这一台是禁用的"
      :translations="{ input: '已禁用的输入框' }"
    >
      <XhPromptInputInput rows="1" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- 空值：按钮转灰，敲进第一个非空白字符就亮 -->
    <XhPromptInputRoot :translations="{ input: '给助手写点什么' }">
      <XhPromptInputInput rows="1" placeholder="空着时发送按钮是灰的" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- 有附件时正文可以为空：allowEmptySubmit 一置真，空值也发得出去 -->
    <XhPromptInputRoot allow-empty-submit :translations="{ input: '带附件的输入框' }">
      <XhPromptInputInput rows="1" placeholder="空着也能发（当作已经挂了附件）" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
  </div>
</template>
