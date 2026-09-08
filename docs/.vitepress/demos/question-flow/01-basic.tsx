// 基础用法 | 一次一题：单选选中后自动翻到下一题，多选等人点继续，末题上那颗按钮变成发送
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import type { ReactNode } from "react";
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
  XhQuestionFlowResult,
  XhQuestionFlowRoot,
  XhQuestionFlowSkipTrigger,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/react";
import { useState } from "react";

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

export default function Demo(): ReactNode {
  const [sent, setSent] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px" }}>
      <XhQuestionFlowRoot
        questions={questions}
        onSubmit={details => setSent(
          Object.entries(details.answers)
            .map(([id, values]) => `${id}=${values.join("、") || "未答"}`)
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
                    <XhQuestionFlowGroup questionId={question.id}>
                      {question.options.map(option => (
                        <XhQuestionFlowItem
                          key={option.value}
                          questionId={question.id}
                          optionValue={option.value}
                        >
                          {/* 记号由皮肤画：指示符留空即可，不必手打 */}
                          <XhQuestionFlowItemIndicator questionId={question.id} optionValue={option.value} />
                          <XhQuestionFlowItemText questionId={question.id} optionValue={option.value}>
                            {option.label}
                          </XhQuestionFlowItemText>
                        </XhQuestionFlowItem>
                      ))}
                    </XhQuestionFlowGroup>
                  </XhQuestionFlowQuestion>
                ))}
              </XhQuestionFlowTrack>
            </XhQuestionFlowViewport>
            <XhQuestionFlowResult>答案已送出</XhQuestionFlowResult>
            <XhQuestionFlowFooter>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <XhQuestionFlowPrevTrigger />
                <XhQuestionFlowCounter />
                <XhQuestionFlowNextTrigger />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <XhQuestionFlowSkipTrigger>跳过</XhQuestionFlowSkipTrigger>
                <XhQuestionFlowSubmitTrigger>{isLast ? "发送" : "继续"}</XhQuestionFlowSubmitTrigger>
              </div>
            </XhQuestionFlowFooter>
            <XhQuestionFlowLiveRegion />
          </>
        )}
      </XhQuestionFlowRoot>
      {sent && <p style={{ margin: 0 }}>{`收到：${sent}`}</p>}
    </div>
  );
}
