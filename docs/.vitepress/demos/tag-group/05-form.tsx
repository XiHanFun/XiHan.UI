// 随表单提交 | 写了 name 才带表单出口：选中值按逗号拼成一串随表单提交，required 时一枚都没选就拦下
import type { FormEvent, ReactNode } from "react";
import { XhButton, XhTagGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const topics = [
  { value: "design", label: "设计" },
  { value: "a11y", label: "无障碍" },
  { value: "motion", label: "动效" },
];

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitted(String(new FormData(event.currentTarget).get("topics") ?? ""));
  }

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: "12px", maxInlineSize: "420px" }}
      onSubmit={onSubmit}
    >
      <XhTagGroupRoot
        collection={topics}
        defaultValue={["design"]}
        label="关注的话题"
        name="topics"
        selectionMode="multiple"
        required
      />
      <XhButton type="submit" variant="outline" style={{ alignSelf: "start" }}>提交</XhButton>
      <span data-demo-output>{`表单收到：${submitted || "（还没提交）"}`}</span>
    </form>
  );
}
