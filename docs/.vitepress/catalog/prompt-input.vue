<script setup lang="ts">
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhPromptInputRoot :translations="{ input: '给助手写点什么' }" style="inline-size: 240px">
    <XhPromptInputInput rows="1" placeholder="给助手写点什么…" />
    <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
  </XhPromptInputRoot>
</template>
