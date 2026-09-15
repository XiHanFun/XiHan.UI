const n=`// 受控当前题 | 进度归宿主管：外面的按钮直接跳题，答案也一并受控，组件只发意图
import type { QuestionFlowAnswers, QuestionFlowQuestion } from "@xihan-ui/headless";
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
  XhQuestionFlowRoot,
  XhQuestionFlowSubmitTrigger,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from "@xihan-ui/react";
import { useState } from "react";

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

export default function Demo(): ReactNode {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionFlowAnswers>({});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px" }}>
      <div style={{ display: "flex", gap: "6px" }}>
        {questions.map((question, i) => (
          <button key={question.id} type="button" onClick={() => setIndex(i)}>
            {\`跳到第 \${i + 1} 题\`}
          </button>
        ))}
      </div>
      <XhQuestionFlowRoot
        index={index}
        onIndexChange={details => setIndex(details.index)}
        answers={answers}
        onAnswersChange={details => setAnswers(details.answers)}
        questions={questions}
        allowSkip={false}
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
                  </XhQuestionFlowQuestion>
                ))}
              </XhQuestionFlowTrack>
            </XhQuestionFlowViewport>
            <XhQuestionFlowFooter>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <XhQuestionFlowPrevTrigger />
                <XhQuestionFlowCounter />
                <XhQuestionFlowNextTrigger />
              </div>
              <XhQuestionFlowSubmitTrigger>{isLast ? "发送" : "继续"}</XhQuestionFlowSubmitTrigger>
            </XhQuestionFlowFooter>
            <XhQuestionFlowLiveRegion />
          </>
        )}
      </XhQuestionFlowRoot>
      <p style={{ margin: 0 }}>
        {\`宿主手上的进度：第 \${index + 1} 题；已答 \${Object.keys(answers).length} 题\`}
      </p>
    </div>
  );
}
`;export{n as default};
