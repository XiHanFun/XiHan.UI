const e=`// 多种前缀 | @ 提人、# 打标签共用一个输入框，query-change 会报回是哪个前缀触发的
import type { ReactNode } from "react";
import { XhMentionRoot } from "@xihan-ui/react";
import { useState } from "react";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

const topics = [
  { value: "bug", label: "缺陷" },
  { value: "release", label: "发版" },
  { value: "design", label: "设计评审" },
];

export default function Demo(): ReactNode {
  const [text, setText] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [prefix, setPrefix] = useState<string | null>(null);

  // 按前缀选数据源，再按查询串筛一遍
  const pool = prefix === "#" ? topics : people;
  const q = (query ?? "").trim().toLowerCase();
  const filtered = q === ""
    ? pool
    : pool.filter(item => item.value.includes(q) || item.label.toLowerCase().includes(q));

  function onQuery(details: { query: string | null; prefix: string | null }): void {
    setQuery(details.query);
    setPrefix(details.prefix);
  }

  return (
    <>
      <XhMentionRoot
        value={text}
        onValueChange={details => setText(details.value)}
        triggerPrefix={["@", "#"]}
        collection={filtered}
        placeholder="@ 提及同事，# 打标签"
        translations={{ input: "正文", content: "候选" }}
        onQueryChange={onQuery}
      />
      <p>{\`当前前缀：\${prefix ?? "（无触发）"}\`}</p>
    </>
  );
}
`;export{e as default};
