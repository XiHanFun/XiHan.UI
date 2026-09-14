<!-- 语气 | tone 换聚焦描边与发送钮用哪族颜色，输入与提交那条链不受影响 -->
<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhPromptInputRoot
      v-for="tone in tones"
      :key="tone"
      :tone="tone"
      :translations="{ input: '给助手写点什么' }"
    >
      <XhPromptInputInput rows="1" :placeholder="`${tone} 档`" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>
  </div>
</template>
