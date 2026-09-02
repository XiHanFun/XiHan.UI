<!-- 三档提交按键 | enter 档回车就发、mod-enter 档只有 Ctrl/Cmd+Enter 发、none 档两种按法都换行，提交只剩发送按钮 -->
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const log = ref("（还没发过）");
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 默认档：Enter 提交、Shift+Enter 换行，Mod+Enter 也提交 -->
    <XhPromptInputRoot
      :translations="{ input: 'Enter 提交' }"
      @submit="log = `enter 档发出：${$event.value}`"
    >
      <XhPromptInputInput rows="1" placeholder="Enter 就发出去" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- Enter 留给换行，提交收到组合键上：长文起草时不会敲一半被发出去 -->
    <XhPromptInputRoot
      submit-key="mod-enter"
      :translations="{ input: 'Ctrl 或 Cmd 加 Enter 提交' }"
      @submit="log = `mod-enter 档发出：${$event.value}`"
    >
      <XhPromptInputInput rows="2" placeholder="Enter 换行，Ctrl/Cmd+Enter 才发" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <!-- 键盘一个提交出口都不留：Enter 与 Mod+Enter 都原样交回浏览器插换行 -->
    <XhPromptInputRoot
      submit-key="none"
      :translations="{ input: '只用发送按钮提交' }"
      @submit="log = `none 档发出：${$event.value}`"
    >
      <XhPromptInputInput rows="2" placeholder="键盘怎么按都只换行" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <span>{{ log }}</span>
  </div>
</template>
