// 尺寸 | size 换问句、选项行与页脚按钮的几何档，三档共用同一份问题
import type { QuestionFlowQuestion } from "@xihan-ui/headless";
import type { ReactNode } from "react";
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
} from "@xihan-ui/react";

const options = [
  { value: "ui", label: "只改界面" },
  { value: "api", label: "改到接口" },
];

const questions: QuestionFlowQuestion[] = [
  {
    id: "scope",
    prompt: "这次改动动到哪一层？",
    type: "single",
    options,
  },
];

const sizes = ["sm", "md", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "340px" }}>
      {sizes.map(size => (
        <XhQuestionFlowRoot key={size} questions={questions} size={size}>
          <XhQuestionFlowViewport>
            <XhQuestionFlowTrack>
              <XhQuestionFlowQuestion questionId="scope">
                <XhQuestionFlowPrompt questionId="scope">
                  {`这次改动动到哪一层？（${size}）`}
                </XhQuestionFlowPrompt>
                <XhQuestionFlowGroup questionId="scope">
                  {options.map(option => (
                    <XhQuestionFlowItem
                      key={option.value}
                      questionId="scope"
                      optionValue={option.value}
                    >
                      <XhQuestionFlowItemIndicator questionId="scope" optionValue={option.value} />
                      <XhQuestionFlowItemText questionId="scope" optionValue={option.value}>
                        {option.label}
                      </XhQuestionFlowItemText>
                    </XhQuestionFlowItem>
                  ))}
                </XhQuestionFlowGroup>
              </XhQuestionFlowQuestion>
            </XhQuestionFlowTrack>
          </XhQuestionFlowViewport>
          <XhQuestionFlowFooter>
            <XhQuestionFlowSubmitTrigger>发送</XhQuestionFlowSubmitTrigger>
          </XhQuestionFlowFooter>
        </XhQuestionFlowRoot>
      ))}
    </div>
  );
}
