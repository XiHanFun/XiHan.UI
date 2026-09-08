// 候选里的自定义内容 | 条目内容由你写：主文本之外还能带副标题与标记，过滤与键盘行为一点不变
import type { ReactNode } from "react";
import {
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
  XhTagLabel,
  XhTagRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const mailboxes = [
  { value: "gmail", label: "name@gmail.com", note: "国际", tone: "info" },
  { value: "qq", label: "name@qq.com", note: "国内", tone: "success" },
  { value: "163", label: "name@163.com", note: "国内", tone: "success" },
] as const;

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? mailboxes : mailboxes.filter(m => m.label.toLowerCase().includes(q));

  return (
    <>
      <XhComboboxRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        inputValue={query}
        onInputValueChange={details => setQuery(details.inputValue)}
        openOnClick
        placeholder="输入邮箱前缀"
      >
        <XhComboboxLabel>邮箱</XhComboboxLabel>
        <XhComboboxControl>
          <XhComboboxInput />
          <XhComboboxTrigger />
          <XhComboboxClearTrigger />
        </XhComboboxControl>
        <XhComboboxPositioner>
          <XhComboboxContent>
            {filtered.map(m => (
              <XhComboboxItem key={m.value} value={m.value}>
                <XhComboboxItemText>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    {m.label}
                    <XhTagRoot variant="subtle" tone={m.tone} size="sm">
                      <XhTagLabel>{m.note}</XhTagLabel>
                    </XhTagRoot>
                  </span>
                </XhComboboxItemText>
                <XhComboboxItemIndicator />
              </XhComboboxItem>
            ))}
          </XhComboboxContent>
          <XhComboboxEmpty>没有匹配的邮箱</XhComboboxEmpty>
        </XhComboboxPositioner>
      </XhComboboxRoot>
      <p>{`当前值：${value[0] ?? "（未选）"}`}</p>
    </>
  );
}
