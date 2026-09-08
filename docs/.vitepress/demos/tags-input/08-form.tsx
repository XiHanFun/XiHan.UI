// 随表单提交 | 写了 name 与 hidden-input 才参与提交，整份标签按断词符拼成一串；框里没内容时回车留给表单
import type { FormEvent, ReactNode } from "react";
import {
  XhButton,
  XhTagsInputControl,
  XhTagsInputHiddenInput,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [tags, setTags] = useState<string[]>(["Vue", "TypeScript"]);
  const [submitted, setSubmitted] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(String(data.get("skills") ?? ""));
  }

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: "12px", maxInlineSize: "420px" }}
      onSubmit={onSubmit}
    >
      <XhTagsInputRoot
        value={tags}
        onValueChange={details => setTags(details.value)}
        name="skills"
        delimiter=","
        placeholder="回车落一个"
      >
        {({ value }) => (
          <>
            <XhTagsInputLabel>技术栈</XhTagsInputLabel>
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
            <XhTagsInputHiddenInput />
          </>
        )}
      </XhTagsInputRoot>
      <XhButton type="submit" variant="outline" style={{ alignSelf: "start" }}>提交</XhButton>
      <span>{`表单收到：${submitted || "（还没提交）"}`}</span>
    </form>
  );
}
