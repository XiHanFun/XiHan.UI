<!-- 基础用法 | Enter 提交、Shift+Enter 换行；输入法组合中的 Enter 一律放行，那一下是在确认候选词 -->
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const sent = ref<string[]>([]);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <XhPromptInputRoot
      :translations="{ input: '给助手写点什么' }"
      @submit="sent.push($event.value)"
    >
      <XhPromptInputInput rows="1" placeholder="给助手写点什么…" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
    <p v-if="sent.length" style="margin: 0;">已发出：{{ sent.join(" / ") }}</p>
  </div>
</template>
