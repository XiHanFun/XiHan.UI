var e=`// 准入判定 | validate 逐个判定新标签，返回拒绝码即拒收：这一次提交整体不生效、文本留在框里改；tag-reject 报告拒收的标签与原因，重复的照常消费但也会报
import type { ReactNode } from "react";
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const reasonText: Record<string, string> = {
  "duplicate": "已经在列表里",
  "invalid-email": "不是邮箱地址",
};

function validate(tag: string): string | null {
  return /^[^\\s@]+@[^\\s@.]+(?:\\.[^\\s@.]+)+$/.test(tag) ? null : "invalid-email";
}

export default function Demo(): ReactNode {
  const [hint, setHint] = useState("");

  function onTagReject(details: { tags: { tag: string; reasons: string[] }[] }): void {
    setHint(details.tags
      .map(({ tag, reasons }) => \`\${tag}：\${reasons.map(r => reasonText[r] ?? r).join("、")}\`)
      .join("；"));
  }

  return (
    <>
      <XhTagsInputRoot
        defaultValue={["ada@example.com"]}
        validate={validate}
        placeholder="输入邮箱后回车"
        style={{ maxInlineSize: "420px" }}
        onTagReject={onTagReject}
        onValueChange={() => setHint("")}
      >
        {({ value }) => (
          <>
            <XhTagsInputLabel>收件人</XhTagsInputLabel>
            <XhTagsInputControl>
              {value.map(t => (
                <XhTagsInputItem key={t} value={t}>
                  <XhTagsInputItemPreview>
                    <XhTagsInputItemText>{t}</XhTagsInputItemText>
                    <XhTagsInputItemDeleteTrigger />
                  </XhTagsInputItemPreview>
                </XhTagsInputItem>
              ))}
              <XhTagsInputInput />
            </XhTagsInputControl>
          </>
        )}
      </XhTagsInputRoot>
      {hint ? <p style={{ color: "var(--xh-fg-danger)" }}>{hint}</p> : null}
    </>
  );
}
`;export{e as default};