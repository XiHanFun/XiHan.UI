// 受控正文与选中回调 | 正文由宿主持有，select 事件报回插进去的是哪一条，用来攒收件人名单
import type { ReactNode } from "react";
import { XhMentionRoot } from "@xihan-ui/react";
import { useState } from "react";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

export default function Demo(): ReactNode {
  const [text, setText] = useState("周会纪要：");
  const [query, setQuery] = useState<string | null>(null);
  const [mentioned, setMentioned] = useState<string[]>([]);

  const q = (query ?? "").trim().toLowerCase();
  const filtered = q === ""
    ? people
    : people.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));

  // 名单按值去重；正文里被删掉的提及不在这里回收，需要的话按正文重新扫一遍
  function onSelect(details: { value: string }): void {
    setMentioned(prev => (prev.includes(details.value) ? prev : [...prev, details.value]));
  }

  function reset(): void {
    setText("");
    setMentioned([]);
  }

  return (
    <>
      <XhMentionRoot
        value={text}
        onValueChange={details => setText(details.value)}
        collection={filtered}
        tone="brand"
        placeholder="输入 @ 提及同事"
        translations={{ input: "会议纪要", content: "提及谁" }}
        onQueryChange={details => setQuery(details.query)}
        onSelect={onSelect}
      />
      <p>{`已提及：${mentioned.join("、") || "（无）"}`}</p>
      <button type="button" onClick={reset}>清空</button>
    </>
  );
}
