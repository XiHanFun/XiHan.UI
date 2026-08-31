<!-- 基础用法 | 想的时候自动展开、想完自动收起；状态文案由组件按在不在想与时长给出 -->
<script setup lang="ts">
import {
  XhReasoningContent,
  XhReasoningIndicator,
  XhReasoningLabel,
  XhReasoningRoot,
  XhReasoningTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

const streaming = ref(true);
const startTime = ref(Date.now());
const endTime = ref<number | undefined>(undefined);
const text = ref("");

const full = "先看约束：只读一次文件，别改它。再看目标：找出导出面。";
let at = 0;
let timer = 0;
const tick = () => {
  at = Math.min(at + 2, full.length);
  text.value = full.slice(0, at);
  if (at < full.length) {
    timer = window.setTimeout(tick, 60);
    return;
  }
  endTime.value = Date.now();
  streaming.value = false;
};
tick();

onBeforeUnmount(() => window.clearTimeout(timer));

// 名字位不写内容时显示这几句，{seconds} 由组件代入
const translations = {
  label: "思考过程",
  thinking: "正在思考…",
  thoughtFor: "想了 {seconds} 秒",
};
</script>

<template>
  <XhReasoningRoot
    :streaming="streaming"
    :start-time="startTime"
    :end-time="endTime"
    :translations="translations"
  >
    <XhReasoningTrigger>
      <XhReasoningIndicator />
      <XhReasoningLabel />
    </XhReasoningTrigger>
    <XhReasoningContent>{{ text }}</XhReasoningContent>
  </XhReasoningRoot>
</template>
