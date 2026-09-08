// 表单 | 给了 name 才带上隐藏输入参与提交；宿主表单点重置，选中值回落到 default-value
import type { FormEvent, ReactNode } from "react";
import { XhSegmentedRoot } from "@xihan-ui/react";
import { useState } from "react";

const channels = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
];

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(String(data.get("channel") ?? ""));
  }

  return (
    <form
      style={{ display: "flex", gap: "12px", alignItems: "center" }}
      onSubmit={onSubmit}
    >
      <XhSegmentedRoot
        collection={channels}
        name="channel"
        defaultValue="email"
        aria-label="通知渠道"
      />
      <button type="submit">提交</button>
      <button type="reset">重置</button>
      <span>{`已提交：${submitted || "（还没提交）"}`}</span>
    </form>
  );
}
