<script setup lang="ts">
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowCounter,
  XhQuestionFlowFooter,
  XhQuestionFlowGroup,
  XhQuestionFlowItem,
  XhQuestionFlowItemIndicator,
  XhQuestionFlowItemText,
  XhQuestionFlowLiveRegion,
  XhQuestionFlowNextTrigger,
  XhQuestionFlowPrevTrigger,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/vue";

const questions: QuestionFlowQuestion[] = [
  { id: "scope", prompt: "这次改动动到哪一层？", type: "single", options: [{ value: "ui", label: "只改界面" }, { value: "api", label: "改到接口" }] },
  { id: "branch", prompt: "落到哪条分支？", type: "single", options: [{ value: "main", label: "主干" }, { value: "feature", label: "特性分支" }] },
];
</script>

<template>
  <XhQuestionFlowRoot :questions="questions" style="inline-size: 240px; font-size: 13px">
    <XhQuestionFlowViewport>
      <XhQuestionFlowTrack>
        <XhQuestionFlowQuestion v-for="question in questions" :key="question.id" :question-id="question.id">
          <XhQuestionFlowPrompt :question-id="question.id">{{ question.prompt }}</XhQuestionFlowPrompt>
          <XhQuestionFlowGroup :question-id="question.id">
            <XhQuestionFlowItem v-for="option in question.options" :key="option.value" :question-id="question.id" :option-value="option.value">
              <XhQuestionFlowItemIndicator :question-id="question.id" :option-value="option.value" />
              <XhQuestionFlowItemText :question-id="question.id" :option-value="option.value">{{ option.label }}</XhQuestionFlowItemText>
            </XhQuestionFlowItem>
          </XhQuestionFlowGroup>
        </XhQuestionFlowQuestion>
      </XhQuestionFlowTrack>
    </XhQuestionFlowViewport>
    <XhQuestionFlowFooter>
      <div style="display: flex; align-items: center; gap: 4px">
        <XhQuestionFlowPrevTrigger />
        <XhQuestionFlowCounter />
        <XhQuestionFlowNextTrigger />
      </div>
    </XhQuestionFlowFooter>
    <XhQuestionFlowLiveRegion />
  </XhQuestionFlowRoot>
</template>
