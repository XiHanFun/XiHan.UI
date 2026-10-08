var e=`// 说明与多选上下限 | 选项的 description 写进 item-description，跟着选项名一起念；多选的 minSelections / maxSelections 管选够与选满，数量要求写进题目说明 description 并描述选项组
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import type { ReactNode } from "react";
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
} from "@xihan-ui/react";
import { useState } from "react";

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

export default function Demo(): ReactNode {
  const [sent, setSent] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "360px" }}>
      <XhQuestionFlowRoot
        questions={questions}
        translations={translations}
        autoAdvance={false}
        onSubmit={details => setSent(
          Object.entries(details.answers)
            .map(([id, values]) => \`\${id}=\${values.join("、")}\`)
            .join("；"),
        )}
      >
        {({ isLast }) => (
          <>
            <XhQuestionFlowViewport>
              <XhQuestionFlowTrack>
                {questions.map(question => (
                  <XhQuestionFlowQuestion key={question.id} questionId={question.id}>
                    <XhQuestionFlowPrompt questionId={question.id}>{question.prompt}</XhQuestionFlowPrompt>
                    {/* 留空：写上题目自带的说明，或多选的数量要求 */}
                    <XhQuestionFlowDescription questionId={question.id} />
                    <XhQuestionFlowGroup questionId={question.id}>
                      {question.options.map(option => (
                        <XhQuestionFlowItem key={option.value} questionId={question.id} optionValue={option.value}>
                          <XhQuestionFlowItemIndicator questionId={question.id} optionValue={option.value} />
                          <XhQuestionFlowItemText questionId={question.id} optionValue={option.value}>
                            {option.label}
                          </XhQuestionFlowItemText>
                          {option.description && (
                            <XhQuestionFlowItemDescription questionId={question.id} optionValue={option.value}>
                              {option.description}
                            </XhQuestionFlowItemDescription>
                          )}
                        </XhQuestionFlowItem>
                      ))}
                    </XhQuestionFlowGroup>
                  </XhQuestionFlowQuestion>
                ))}
              </XhQuestionFlowTrack>
            </XhQuestionFlowViewport>
            <XhQuestionFlowFooter>
              <XhQuestionFlowSubmitTrigger>{isLast ? "发送" : "继续"}</XhQuestionFlowSubmitTrigger>
            </XhQuestionFlowFooter>
            <XhQuestionFlowLiveRegion />
          </>
        )}
      </XhQuestionFlowRoot>
      {sent && <p style={{ margin: 0 }}>{\`收到：\${sent}\`}</p>}
    </div>
  );
}
`;export{e as default};