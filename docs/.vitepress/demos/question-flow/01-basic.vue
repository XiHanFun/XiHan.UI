<!-- 基础用法 | 一次一题：单选选中后自动翻到下一题，多选等人点继续，末题上那颗按钮变成发送 -->
<script setup lang="ts">
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowLiveRegion,
  XhQuestionFlowCounter,
  XhQuestionFlowFooter,
  XhQuestionFlowNextTrigger,
  XhQuestionFlowOption,
  XhQuestionFlowOptionGroup,
  XhQuestionFlowOptionIndicator,
  XhQuestionFlowOptionLabel,
  XhQuestionFlowPrevTrigger,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowResult,
  XhQuestionFlowRoot,
  XhQuestionFlowSkipTrigger,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const questions: QuestionFlowQuestion[] = [
  {
    id: "scope",
    prompt: "这次改动动到哪一层？",
    type: "single",
    options: [
      { value: "ui", label: "只改界面" },
      { value: "api", label: "改到接口" },
      { value: "db", label: "连数据结构一起改" },
    ],
  },
  {
    id: "checks",
    prompt: "要顺带补哪些检查？",
    type: "multiple",
    options: [
      { value: "unit", label: "单元测试" },
      { value: "e2e", label: "端到端" },
    ],
  },
  {
    id: "branch",
    prompt: "落到哪条分支？",
    type: "single",
    options: [
      { value: "main", label: "直接进主干" },
      { value: "feature", label: "先开一条特性分支" },
    ],
  },
];

const sent = ref("");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 340px;">
    <XhQuestionFlowRoot
      v-slot="{ isLast }"
      :questions="questions"
      @submit="sent = Object.entries($event.answers).map(([id, values]) => `${id}=${values.join('、') || '未答'}`).join('；')"
    >
      <XhQuestionFlowViewport>
        <XhQuestionFlowTrack>
          <XhQuestionFlowQuestion v-for="question in questions" :key="question.id" :question-id="question.id">
            <XhQuestionFlowPrompt :question-id="question.id">{{ question.prompt }}</XhQuestionFlowPrompt>
            <XhQuestionFlowOptionGroup :question-id="question.id">
              <XhQuestionFlowOption
                v-for="option in question.options"
                :key="option.value"
                :question-id="question.id"
                :option-value="option.value"
              >
                <!-- 记号由皮肤画：指示符留空即可，不必手打 -->
                <XhQuestionFlowOptionIndicator :question-id="question.id" :option-value="option.value" />
                <XhQuestionFlowOptionLabel :question-id="question.id" :option-value="option.value">
                  {{ option.label }}
                </XhQuestionFlowOptionLabel>
              </XhQuestionFlowOption>
            </XhQuestionFlowOptionGroup>
          </XhQuestionFlowQuestion>
        </XhQuestionFlowTrack>
      </XhQuestionFlowViewport>
      <XhQuestionFlowResult>答案已送出</XhQuestionFlowResult>
      <XhQuestionFlowFooter>
        <div style="display: flex; align-items: center; gap: 4px;">
          <XhQuestionFlowPrevTrigger />
          <XhQuestionFlowCounter />
          <XhQuestionFlowNextTrigger />
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <XhQuestionFlowSkipTrigger>跳过</XhQuestionFlowSkipTrigger>
          <XhQuestionFlowSubmitTrigger>{{ isLast ? "发送" : "继续" }}</XhQuestionFlowSubmitTrigger>
        </div>
      </XhQuestionFlowFooter>
      <XhQuestionFlowLiveRegion />
    </XhQuestionFlowRoot>
    <p v-if="sent" style="margin: 0;">收到：{{ sent }}</p>
  </div>
</template>
