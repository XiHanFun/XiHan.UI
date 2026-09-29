const n=`<!-- 说明与多选上下限 | 选项的 description 写进 item-description，跟着选项名一起念；多选的 minSelections / maxSelections 管选够与选满，数量要求写进题目说明 description 并描述选项组 -->
<script setup lang="ts">
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import {
  XhQuestionFlowDescription,
  XhQuestionFlowFooter,
  XhQuestionFlowGroup,
  XhQuestionFlowItem,
  XhQuestionFlowItemDescription,
  XhQuestionFlowItemIndicator,
  XhQuestionFlowItemText,
  XhQuestionFlowLiveRegion,
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
    id: "cadence",
    prompt: "按什么节奏发布？",
    description: "会影响发布说明的写法。",
    type: "single",
    options: [
      { value: "weekly", label: "每周", description: "小步快跑，回滚成本低" },
      { value: "monthly", label: "每月", description: "攒一批再发，说明写得更完整" },
    ],
  },
  {
    id: "checks",
    prompt: "上线前跑哪些检查？",
    type: "multiple",
    // 没写 description 时，数量要求代填成题目说明
    minSelections: 2,
    maxSelections: 3,
    options: [
      { value: "unit", label: "单元测试" },
      { value: "e2e", label: "端到端", description: "约 20 分钟" },
      { value: "bench", label: "性能基准", description: "只在夜里跑" },
      { value: "audit", label: "依赖安全扫描" },
    ],
  },
];

const translations = {
  selectionRange: (min: number, max: number | undefined) => (max === undefined ? \`至少选 \${min} 项\` : \`选 \${min} 到 \${max} 项\`),
};

const sent = ref("");
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 360px;">
    <XhQuestionFlowRoot
      v-slot="{ isLast }"
      :questions="questions"
      :translations="translations"
      :auto-advance="false"
      @submit="sent = Object.entries($event.answers).map(([id, values]) => \`\${id}=\${values.join('、')}\`).join('；')"
    >
      <XhQuestionFlowViewport>
        <XhQuestionFlowTrack>
          <XhQuestionFlowQuestion v-for="question in questions" :key="question.id" :question-id="question.id">
            <XhQuestionFlowPrompt :question-id="question.id">{{ question.prompt }}</XhQuestionFlowPrompt>
            <!-- 留空：写上题目自带的说明，或多选的数量要求 -->
            <XhQuestionFlowDescription :question-id="question.id" />
            <XhQuestionFlowGroup :question-id="question.id">
              <XhQuestionFlowItem
                v-for="option in question.options"
                :key="option.value"
                :question-id="question.id"
                :option-value="option.value"
              >
                <XhQuestionFlowItemIndicator :question-id="question.id" :option-value="option.value" />
                <XhQuestionFlowItemText :question-id="question.id" :option-value="option.value">
                  {{ option.label }}
                </XhQuestionFlowItemText>
                <XhQuestionFlowItemDescription v-if="option.description" :question-id="question.id" :option-value="option.value">
                  {{ option.description }}
                </XhQuestionFlowItemDescription>
              </XhQuestionFlowItem>
            </XhQuestionFlowGroup>
          </XhQuestionFlowQuestion>
        </XhQuestionFlowTrack>
      </XhQuestionFlowViewport>
      <XhQuestionFlowFooter>
        <XhQuestionFlowSubmitTrigger>{{ isLast ? "发送" : "继续" }}</XhQuestionFlowSubmitTrigger>
      </XhQuestionFlowFooter>
      <XhQuestionFlowLiveRegion />
    </XhQuestionFlowRoot>
    <p v-if="sent" style="margin: 0;">收到：{{ sent }}</p>
  </div>
</template>
`;export{n as default};
