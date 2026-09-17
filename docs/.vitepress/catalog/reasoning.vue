<script setup lang="ts">
import { XhReasoningContent, XhReasoningIndicator, XhReasoningLabel, XhReasoningRoot, XhReasoningTrigger } from "@xihan-ui/vue";

// 已经想完的一段：起止时刻钉死，标签上恒显示同一句
const translations = { label: "思考过程", thinking: "正在思考…", thoughtFor: "想了 {seconds} 秒" };
</script>

<template>
  <XhReasoningRoot :streaming="false" :start-time="1_000" :end-time="4_000" :translations="translations" default-open style="inline-size: var(--xh-doc-catalog-w)">
    <XhReasoningTrigger>
      <XhReasoningIndicator />
      <XhReasoningLabel />
    </XhReasoningTrigger>
    <XhReasoningContent>先看约束：只读一次文件，别改它。再看目标：找出导出面。</XhReasoningContent>
  </XhReasoningRoot>
</template>
