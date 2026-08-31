<!-- 基础用法 | 想的时候自动展开、想完自动收起；时长由两个时刻算出来，任一缺席就不显示 -->
<script setup lang="ts">
import {
  XhReasoningContent,
  XhReasoningDuration,
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

// 模板串由调用方现场代入，连接层不做插值
const durationText = (ms: number | undefined) =>
  ms === undefined ? "思考中…" : `用时 ${Math.round(ms / 100) / 10} 秒`;
</script>

<template>
  <XhReasoningRoot
    v-slot="{ durationMs }"
    :streaming="streaming"
    :start-time="startTime"
    :end-time="endTime"
  >
    <XhReasoningTrigger>
      <XhReasoningIndicator>›</XhReasoningIndicator>
      <XhReasoningLabel>思考过程</XhReasoningLabel>
      <XhReasoningDuration>{{ durationText(durationMs) }}</XhReasoningDuration>
    </XhReasoningTrigger>
    <XhReasoningContent>{{ text }}</XhReasoningContent>
  </XhReasoningRoot>
</template>
