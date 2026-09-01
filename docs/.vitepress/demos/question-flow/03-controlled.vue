<!-- 受控当前题 | 进度归宿主管：外面的按钮直接跳题，答案也一并受控，组件只发意图 -->
<script setup lang="ts">
import type { QuestionFlowAnswers, QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowAnnouncement,
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
  XhQuestionFlowRoot,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const questions: QuestionFlowQuestion[] = [
  {
    id: "target",
    prompt: "先修哪一处？",
    type: "single",
    options: [
      { value: "crash", label: "崩溃" },
      { value: "slow", label: "卡顿" },
    ],
  },
  {
    id: "when",
    prompt: "什么时候上线？",
    type: "single",
    options: [
      { value: "now", label: "今天" },
      { value: "week", label: "本周内" },
    ],
  },
];

const index = ref(0);
const answers = ref<QuestionFlowAnswers>({});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 340px;">
    <div style="display: flex; gap: 6px;">
      <button v-for="(question, i) in questions" :key="question.id" type="button" @click="index = i">
        跳到第 {{ i + 1 }} 题
      </button>
    </div>
    <XhQuestionFlowRoot
      v-slot="{ isLast }"
      v-model:index="index"
      v-model:answers="answers"
      :questions="questions"
      :allow-skip="false"
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
          </XhQuestionFlowQuestion>
        </XhQuestionFlowTrack>
      </XhQuestionFlowViewport>
      <XhQuestionFlowFooter>
        <div style="display: flex; align-items: center; gap: 4px;">
          <XhQuestionFlowPrevTrigger />
          <XhQuestionFlowCounter />
          <XhQuestionFlowNextTrigger />
        </div>
        <XhQuestionFlowSubmitTrigger>{{ isLast ? "发送" : "继续" }}</XhQuestionFlowSubmitTrigger>
      </XhQuestionFlowFooter>
      <XhQuestionFlowAnnouncement />
    </XhQuestionFlowRoot>
    <p style="margin: 0;">宿主手上的进度：第 {{ index + 1 }} 题；已答 {{ Object.keys(answers).length }} 题</p>
  </div>
</template>
