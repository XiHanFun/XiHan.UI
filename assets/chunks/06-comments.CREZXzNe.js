const e=`// 行评论 | commentable 在每行正文前给一颗评论钮，点它报出 comment-request；挂在 commentLines 里的行在代码下方铺出评论容器，内容由 comment 插槽写
import type { DiffViewCommentRequestDetails, DiffViewLineRef } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { computeTextDiff } from "@xihan-ui/headless";
import {
  XhButton,
  XhDiffViewBody,
  XhDiffViewHeader,
  XhDiffViewRoot,
  XhDiffViewSummary,
  XhDiffViewViewport,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

const before = \`export function createClient(base: string) {
  return fetchJson(base, { timeout: 5000 })
}\`;
const after = \`export function createClient(base: string, token?: string) {
  const headers = token ? { authorization: token } : {}
  return fetchJson(base, { timeout: 30000, headers })
}\`;
const model = computeTextDiff(before, after);

function keyOf(ref: DiffViewLineRef): string {
  return \`\${ref.side}:\${ref.line}\`;
}

export default function Demo(): ReactNode {
  // 已有的评论，一行一条
  const [comments, setComments] = useState(() => new Map([["new:3", "超时从 5 秒放到 30 秒，网关那边的超时也要一起改。"]]));
  // 正在写的那一条
  const [draft, setDraft] = useState<DiffViewLineRef | null>(null);
  const [draftText, setDraftText] = useState("");

  const commentLines = useMemo(() => {
    const lines: DiffViewLineRef[] = [...comments.keys()].map((key) => {
      const [side, line] = key.split(":");
      return { side: side as DiffViewLineRef["side"], line: Number(line) };
    });
    if (draft && !comments.has(keyOf(draft)))
      lines.push(draft);
    return lines;
  }, [comments, draft]);

  function request(details: DiffViewCommentRequestDetails): void {
    setDraft({ side: details.side, line: details.line });
    setDraftText(comments.get(keyOf(details)) ?? "");
  }

  function save(): void {
    if (draft && draftText.trim() !== "")
      setComments(new Map(comments).set(keyOf(draft), draftText.trim()));
    setDraft(null);
  }

  return (
    <XhDiffViewRoot model={model} commentable commentLines={commentLines} onCommentRequest={request}>
      <XhDiffViewHeader>
        <span>src/client.ts</span>
        <XhDiffViewSummary change="added" />
        <XhDiffViewSummary change="removed" />
      </XhDiffViewHeader>
      <XhDiffViewViewport>
        <XhDiffViewBody
          renderComment={({ side, line }) => (draft && keyOf(draft) === keyOf({ side, line })
            ? (
                <div style={{ display: "grid", gap: "8px" }}>
                  <XhTextFieldRoot value={draftText} onValueChange={details => setDraftText(details.value)}>
                    <XhTextFieldLabel>{\`\${side === "old" ? "旧" : "新"}第 \${line} 行的评论\`}</XhTextFieldLabel>
                    <XhTextFieldControl>
                      <XhTextFieldInput />
                    </XhTextFieldControl>
                  </XhTextFieldRoot>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <XhButton size="sm" onClick={save}>保存</XhButton>
                    <XhButton size="sm" variant="ghost" onClick={() => setDraft(null)}>取消</XhButton>
                  </div>
                </div>
              )
            : comments.get(keyOf({ side, line })))}
        />
      </XhDiffViewViewport>
    </XhDiffViewRoot>
  );
}
`;export{e as default};
