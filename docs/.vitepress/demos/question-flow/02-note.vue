<!-- 自由文本与跳过 | 选项之外还能自己写一句，写了就算答过；关掉自动前进，每题都等人点继续 -->
<script setup lang="ts">
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowAnnouncement,
  XhQuestionFlowCounter,
  XhQuestionFlowFooter,
  XhQuestionFlowNote,
  XhQuestionFlowOption,
  XhQuestionFlowOptionGroup,
  XhQuestionFlowOptionIndicator,
  XhQuestionFlowOptionLabel,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowSkipTrigger,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const questions: QuestionFlowQuestion[] = [
  {
    id: "tone",
    prompt: "文案用什么口吻？",
    type: "single",
    options: [
      { value: "plain", label: "平铺直叙" },
      { value: "warm", label: "亲切一点" },
    ],
  },
  {
    id: "length",
    prompt: "篇幅控制在多长？",
    type: "single",
    optional: true,
    options: [
      { value: "short", label: "一句话" },
      { value: "long", label: "一段话" },
    ],
  },
];

const log = ref("");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 340px;">
    <XhQuestionFlowRoot
      v-slot="{ isLast }"
      :questions="questions"
      :auto-advance="false"
      tone="neutral"
      variant="subtle"
      :translations="{ note: '自己写一句', notePlaceholder: '都不是，我想要…' }"
      @skip="log = `跳过了第 ${$event.index + 1} 题`"
      @submit="log = `自己写的：${Object.values($event.notes).filter(Boolean).join(' / ') || '（没写）'}`"
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
                <XhQuestionFlowOptionIndicator :question-id="question.id" :option-value="option.value" />
                <XhQuestionFlowOptionLabel :question-id="question.id" :option-value="option.value">
                  {{ option.label }}
                </XhQuestionFlowOptionLabel>
              </XhQuestionFlowOption>
            </XhQuestionFlowOptionGroup>
            <!-- 写了一句就算答过这一题，继续键随之亮起 -->
            <XhQuestionFlowNote :question-id="question.id" />
          </XhQuestionFlowQuestion>
        </XhQuestionFlowTrack>
      </XhQuestionFlowViewport>
      <XhQuestionFlowFooter>
        <XhQuestionFlowCounter />
        <div style="display: flex; align-items: center; gap: 6px;">
          <XhQuestionFlowSkipTrigger>跳过</XhQuestionFlowSkipTrigger>
          <XhQuestionFlowSubmitTrigger>{{ isLast ? "发送" : "继续" }}</XhQuestionFlowSubmitTrigger>
        </div>
      </XhQuestionFlowFooter>
      <XhQuestionFlowAnnouncement />
    </XhQuestionFlowRoot>
    <p v-if="log" style="margin: 0;">{{ log }}</p>
  </div>
</template>
