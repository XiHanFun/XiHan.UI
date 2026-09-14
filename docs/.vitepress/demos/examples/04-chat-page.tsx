// 对话页 | 一条回复里同时摆着思考过程、工具调用、流式正文、代码块与批准闸门，外面是消息流与提示输入框
import type { ApprovalScope, MarkdownBlock, PromptInputSubmitDetails } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
import { createStreamRenderer } from "@xihan-ui/markdown";
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalFooter,
  XhApprovalGroup,
  XhApprovalItem,
  XhApprovalItemIndicator,
  XhApprovalItemText,
  XhApprovalLiveRegion,
  XhApprovalResult,
  XhApprovalRoot,
  XhApprovalTitle,
  XhAvatarFallback,
  XhAvatarRoot,
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewLangLabel,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhMarkdownStreamContent,
  XhMarkdownStreamRoot,
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
  XhReasoningContent,
  XhReasoningIndicator,
  XhReasoningLabel,
  XhReasoningRoot,
  XhReasoningTrigger,
  XhTagLabel,
  XhTagRoot,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const answer = `按你给的约束，改动落在**一个文件**里：

- 事件仍从内核发出，视图不新增状态
- 退场那一档交给动效令牌，组件里不写时长
`;

// 渲染器有状态，一个实例只喂同一条消息的全文
const renderer = createStreamRenderer();
const blocks = renderer.render(answer, { ended: true }) as readonly MarkdownBlock[];

const patch = `export function onClose(reason: CloseReason) {
  if (reason === "escape") return restoreFocus()
  return dismiss()
}`;

const scopes: ApprovalScope[] = [
  { value: "read", label: "读 src/ 下的文件", required: true },
  { value: "write", label: "把这段改动写回去" },
];

const pageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--xh-space-3)",
  inlineSize: "100%",
  blockSize: "520px",
};

const feedStyle: CSSProperties = { flex: 1, minBlockSize: 0 };

const whoStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--xh-space-2)",
};

const textStyle: CSSProperties = { margin: 0 };

// 一条回复里的五件东西竖着排，节奏由同一个间距档定
const answerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--xh-space-3)",
};

const noteStyle: CSSProperties = {
  margin: 0,
  color: "var(--xh-fg-muted)",
  fontSize: "var(--xh-font-size-sm)",
};

export default function Demo(): ReactNode {
  const [decision, setDecision] = useState("");
  const [asked, setAsked] = useState<string[]>([]);

  // 提示输入框收下的话直接追加到问题列表，不接真实模型
  function onSubmit({ value }: PromptInputSubmitDetails): void {
    setAsked(prev => [...prev, value]);
  }

  return (
    <div style={pageStyle}>
      <XhMessageFeedRoot count={2 + asked.length} style={feedStyle}>
        <XhMessageFeedViewport>
          <XhMessageFeedList>
            <XhMessageFeedItem itemId="q1" itemIndex={0} itemRole="user">
              <XhMessageFeedItemLabel>
                <span style={whoStyle}>
                  <XhAvatarRoot size="sm">
                    <XhAvatarFallback>我</XhAvatarFallback>
                  </XhAvatarRoot>
                  我
                </span>
              </XhMessageFeedItemLabel>
              <p style={textStyle}>关掉浮层时焦点要还给触发器，这条改动动了哪些地方？</p>
            </XhMessageFeedItem>

            <XhMessageFeedItem itemId="a1" itemIndex={1} itemRole="assistant">
              <XhMessageFeedItemLabel>
                <span style={whoStyle}>
                  <XhAvatarRoot size="sm">
                    <XhAvatarFallback>曦</XhAvatarFallback>
                  </XhAvatarRoot>
                  助手
                  <XhTagRoot size="sm" variant="subtle">
                    <XhTagLabel>已完成</XhTagLabel>
                  </XhTagRoot>
                </span>
              </XhMessageFeedItemLabel>

              <div style={answerStyle}>
                {/* 想完了：给了起止时刻，名字位自己写成「想了几秒」 */}
                <XhReasoningRoot
                  startTime={0}
                  endTime={2400}
                  translations={{ label: "思考过程", thoughtFor: "想了 {seconds} 秒" }}
                >
                  <XhReasoningTrigger>
                    <XhReasoningIndicator />
                    <XhReasoningLabel />
                  </XhReasoningTrigger>
                  <XhReasoningContent>
                    先确认约束：只读一次文件、不改公开面。再看还焦点这条走的是哪个通路。
                  </XhReasoningContent>
                </XhReasoningRoot>

                <XhToolCallRoot phase="output-available">
                  <XhToolCallTrigger>
                    <XhToolCallIndicator>&rsaquo;</XhToolCallIndicator>
                    <XhToolCallLabel>grep</XhToolCallLabel>
                    <XhToolCallStatus />
                  </XhToolCallTrigger>
                  <XhToolCallContent>
                    <XhToolCallOutput>命中 3 处：dialog、drawer、popover 各一处还焦点。</XhToolCallOutput>
                  </XhToolCallContent>
                </XhToolCallRoot>

                <XhMarkdownStreamRoot blocks={blocks}>
                  <XhMarkdownStreamContent />
                </XhMarkdownStreamRoot>

                <XhCodeViewRoot code={patch} lang="typescript" filename="on-close.ts" complete>
                  <XhCodeViewHeader>
                    <XhCodeViewFilename />
                    <XhCodeViewLangLabel />
                  </XhCodeViewHeader>
                  <XhCodeViewPre>
                    <XhCodeViewCode />
                  </XhCodeViewPre>
                </XhCodeViewRoot>

                {/* 闸门常驻在回复末尾：必选项没勾满就批不了 */}
                <XhApprovalRoot
                  scopes={scopes}
                  tone="warning"
                  onDecision={details => setDecision(details.decision === "approved" ? "已批准" : "已拒绝")}
                >
                  {({ status }) => (
                    <>
                      <XhApprovalTitle>要动你的工作区</XhApprovalTitle>
                      <XhApprovalDescription>写回前先确认这两条范围。</XhApprovalDescription>
                      <XhApprovalGroup>
                        {scopes.map(scope => (
                          <XhApprovalItem
                            key={scope.value}
                            scopeValue={scope.value}
                            scopeLabel={scope.label}
                            scopeRequired={scope.required}
                          >
                            <XhApprovalItemIndicator scopeValue={scope.value} />
                            <XhApprovalItemText scopeValue={scope.value}>{scope.label}</XhApprovalItemText>
                          </XhApprovalItem>
                        ))}
                      </XhApprovalGroup>
                      <XhApprovalResult>{status === "approved" ? "已批准" : "已拒绝"}</XhApprovalResult>
                      <XhApprovalFooter>
                        <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
                        <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
                      </XhApprovalFooter>
                      <XhApprovalLiveRegion />
                    </>
                  )}
                </XhApprovalRoot>
              </div>
            </XhMessageFeedItem>

            {asked.map((question, index) => (
              <XhMessageFeedItem
                key={question}
                itemId={`q${index + 2}`}
                itemIndex={index + 2}
                itemRole="user"
              >
                <XhMessageFeedItemLabel>
                  <span style={whoStyle}>
                    <XhAvatarRoot size="sm">
                      <XhAvatarFallback>我</XhAvatarFallback>
                    </XhAvatarRoot>
                    我
                  </span>
                </XhMessageFeedItemLabel>
                <p style={textStyle}>{question}</p>
              </XhMessageFeedItem>
            ))}
          </XhMessageFeedList>
        </XhMessageFeedViewport>
        <XhMessageFeedScrollToEndTrigger />
      </XhMessageFeedRoot>

      <XhPromptInputRoot translations={{ input: "接着问点什么" }} onSubmit={onSubmit}>
        <XhPromptInputInput rows={1} placeholder="接着问点什么…" />
        <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
      </XhPromptInputRoot>

      {decision && <p style={noteStyle}>{`批准闸门：${decision}`}</p>}
    </div>
  );
}
