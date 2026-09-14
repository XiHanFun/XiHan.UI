<!-- 尺寸 | size 换问句、选项行与页脚按钮的几何档，三档共用同一份问题 -->
<script setup lang="ts">
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowFooter,
  XhQuestionFlowGroup,
  XhQuestionFlowItem,
  XhQuestionFlowItemIndicator,
  XhQuestionFlowItemText,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/vue";

const questions: QuestionFlowQuestion[] = [
  {
    id: "scope",
    prompt: "这次改动动到哪一层？",
    type: "single",
    options: [
      { value: "ui", label: "只改界面" },
      { value: "api", label: "改到接口" },
    ],
  },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 340px">
    <XhQuestionFlowRoot
      v-for="size in ['sm', 'md', 'lg']"
      :key="size"
      :questions="questions"
      :size="size"
    >
      <XhQuestionFlowViewport>
        <XhQuestionFlowTrack>
          <XhQuestionFlowQuestion question-id="scope">
            <XhQuestionFlowPrompt question-id="scope">
              这次改动动到哪一层？（{{ size }}）
            </XhQuestionFlowPrompt>
            <XhQuestionFlowGroup question-id="scope">
              <XhQuestionFlowItem
                v-for="option in questions[0].options"
                :key="option.value"
                question-id="scope"
                :option-value="option.value"
              >
                <XhQuestionFlowItemIndicator question-id="scope" :option-value="option.value" />
                <XhQuestionFlowItemText question-id="scope" :option-value="option.value">
                  {{ option.label }}
                </XhQuestionFlowItemText>
              </XhQuestionFlowItem>
            </XhQuestionFlowGroup>
          </XhQuestionFlowQuestion>
        </XhQuestionFlowTrack>
      </XhQuestionFlowViewport>
      <XhQuestionFlowFooter>
        <XhQuestionFlowSubmitTrigger>发送</XhQuestionFlowSubmitTrigger>
      </XhQuestionFlowFooter>
    </XhQuestionFlowRoot>
  </div>
</template>
