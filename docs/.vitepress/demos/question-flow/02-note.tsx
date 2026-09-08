// 自由文本与跳过 | 选项之外还能自己写一句，写了就算答过；关掉自动前进，每题都等人点继续
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
  XhQuestionFlowNote,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowSkipTrigger,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/react";
import { useState } from "react";

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

export default function Demo(): ReactNode {
  const [log, setLog] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px" }}>
      <XhQuestionFlowRoot
        questions={questions}
        autoAdvance={false}
        tone="neutral"
        variant="subtle"
        translations={{ note: "自己写一句", notePlaceholder: "都不是，我想要…" }}
        onSkip={details => setLog(`跳过了第 ${details.index + 1} 题`)}
        onSubmit={details => setLog(
          `自己写的：${Object.values(details.notes).filter(Boolean).join(" / ") || "（没写）"}`,
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
                          <XhQuestionFlowItemIndicator questionId={question.id} optionValue={option.value} />
                          <XhQuestionFlowItemText questionId={question.id} optionValue={option.value}>
                            {option.label}
                          </XhQuestionFlowItemText>
                        </XhQuestionFlowItem>
                      ))}
                    </XhQuestionFlowGroup>
                    {/* 写了一句就算答过这一题，继续键随之亮起 */}
                    <XhQuestionFlowNote questionId={question.id} />
                  </XhQuestionFlowQuestion>
                ))}
              </XhQuestionFlowTrack>
            </XhQuestionFlowViewport>
            <XhQuestionFlowFooter>
              <XhQuestionFlowCounter />
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <XhQuestionFlowSkipTrigger>跳过</XhQuestionFlowSkipTrigger>
                <XhQuestionFlowSubmitTrigger>{isLast ? "发送" : "继续"}</XhQuestionFlowSubmitTrigger>
              </div>
            </XhQuestionFlowFooter>
            <XhQuestionFlowLiveRegion />
          </>
        )}
      </XhQuestionFlowRoot>
      {log && <p style={{ margin: 0 }}>{log}</p>}
    </div>
  );
}
