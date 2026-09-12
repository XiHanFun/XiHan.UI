// 随表单提交 | 在根里补一个隐藏输入承接选中值，值随原生表单一并提交；浮层收起时回车留给表单
import type { FormEvent, ReactNode } from "react";
import {
  XhButton,
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

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "hangzhou", label: "Hangzhou 杭州" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(String(data.get("city") ?? ""));
  }

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: "12px", maxInlineSize: "420px" }}
      onSubmit={onSubmit}
    >
      <XhComboboxRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        inputValue={query}
        onInputValueChange={details => setQuery(details.inputValue)}
        openOnClick
        placeholder="输入城市名"
      >
        {({ value: picked }) => (
          <>
            <XhComboboxLabel>常驻城市</XhComboboxLabel>
            <XhComboboxControl>
              <XhComboboxInput />
              <XhComboboxTrigger />
              <XhComboboxClearTrigger />
            </XhComboboxControl>
            <XhComboboxPositioner>
              <XhComboboxContent>
                {filtered.map(c => (
                  <XhComboboxItem key={c.value} value={c.value}>
                    <XhComboboxItemText>{c.label}</XhComboboxItemText>
                    <XhComboboxItemIndicator />
                  </XhComboboxItem>
                ))}
              </XhComboboxContent>
              <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
            </XhComboboxPositioner>
            {/* 进表单的出口由作者补：多选时按自己的约定拼串 */}
            <input type="hidden" name="city" value={picked.join(",")} />
          </>
        )}
      </XhComboboxRoot>
      <XhButton type="submit" variant="outline" style={{ alignSelf: "start" }}>提交</XhButton>
      <span>{`表单收到：${submitted || "（还没提交）"}`}</span>
    </form>
  );
}
