// 跟着输入高亮 | 关键词逐字符比对、不拼进正则，敲进 . * ( 这些字符也只当普通字符找
import type { ReactNode } from "react";
import { XhHighlight } from "@xihan-ui/react";
import { useState } from "react";

const rows = [
  "曦寒 UI 1.0 发布说明",
  "版本 120 的兼容性清单",
  "取值写作 a*b 时的转义规则",
];

export default function Demo(): ReactNode {
  const [keyword, setKeyword] = useState("1.0");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <input
        value={keyword}
        placeholder="输入关键词"
        style={{ maxInlineSize: "240px" }}
        onChange={event => setKeyword(event.target.value)}
      />
      {rows.map(row => (
        <XhHighlight key={row} text={row} keyword={keyword} />
      ))}
    </div>
  );
}
