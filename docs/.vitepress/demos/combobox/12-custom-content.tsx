// 自定义内容 | 在候选项中显示辅助信息
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
} from "@xihan-ui/react";
import { useState } from "react";

const mailboxes = [
  { value: "gmail", label: "name@gmail.com", note: "Google 邮箱" },
  { value: "qq", label: "name@qq.com", note: "QQ 邮箱" },
  { value: "163", label: "name@163.com", note: "网易邮箱" },
] as const;

export default function Demo(): ReactNode {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? mailboxes : mailboxes.filter(m => m.label.toLowerCase().includes(q));

  return (
    <XhComboboxRoot
      inputValue={query}
      onInputValueChange={details => setQuery(details.inputValue)}
      openOnClick
      placeholder="搜索邮箱"
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
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span>{m.label}</span>
                  <small style={{ color: "var(--xh-fg-muted)" }}>{m.note}</small>
                </span>
              </XhComboboxItemText>
              <XhComboboxItemIndicator />
            </XhComboboxItem>
          ))}
        </XhComboboxContent>
        <XhComboboxEmpty>没有匹配的邮箱</XhComboboxEmpty>
      </XhComboboxPositioner>
    </XhComboboxRoot>
  );
}
