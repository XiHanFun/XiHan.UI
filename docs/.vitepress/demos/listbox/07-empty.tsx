// 空态 | 条目筛空时收起列表、亮出空态节点：它挂在 content 之外，方向键、连打检索与全选都看不见它
import type { ReactNode } from "react";
import {
  XhEmptyStateDescription,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const members = [
  { value: "liuyi", label: "刘一" },
  { value: "chener", label: "陈二" },
  { value: "zhangsan", label: "张三" },
  { value: "lisi", label: "李四" },
];

export default function Demo(): ReactNode {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const q = query.trim();
  const filtered = q === "" ? members : members.filter(m => m.label.includes(q));

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxInlineSize: "320px" }}>
        <XhTextFieldRoot
          value={query}
          onValueChange={details => setQuery(details.value)}
          placeholder="输入姓名筛选"
        >
          <XhTextFieldLabel>搜索</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
        <XhListboxRoot value={picked} onValueChange={details => setPicked(details.value)}>
          <XhListboxLabel>成员</XhListboxLabel>
          <XhListboxContent hidden={filtered.length === 0}>
            {filtered.map(m => (
              <XhListboxItem key={m.value} value={m.value}>
                <XhListboxItemText>{m.label}</XhListboxItemText>
                <XhListboxItemIndicator />
              </XhListboxItem>
            ))}
          </XhListboxContent>
          {/* 空态节点常挂、靠 hidden 收起，它自带的活区才播报得到这次筛空 */}
          <XhEmptyStateRoot size="sm" hidden={filtered.length > 0}>
            <XhEmptyStateTitle>没有匹配的成员</XhEmptyStateTitle>
            <XhEmptyStateDescription>换个关键词再试试。</XhEmptyStateDescription>
          </XhEmptyStateRoot>
        </XhListboxRoot>
      </div>
      <p>{`已选：${picked.length ? picked.join("、") : "（无）"}`}</p>
    </>
  );
}
