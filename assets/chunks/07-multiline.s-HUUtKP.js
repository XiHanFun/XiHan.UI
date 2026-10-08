var e=`// 多行正文 | 输入框写成 textarea，评论可以换行；插入的引用是一个整体，Backspace 整条删掉
import type { ReactNode } from "react";
import {
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionLabel,
  XhMentionPositioner,
  XhMentionRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

export default function Demo(): ReactNode {
  const [query, setQuery] = useState<string | null>(null);

  const q = (query ?? "").trim().toLowerCase();
  const filtered = q === ""
    ? people
    : people.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));

  return (
    <XhMentionRoot
      collection={filtered}
      placeholder="输入 @ 提及同事，Enter 换行"
      translations={{ content: "提及谁" }}
      onQueryChange={details => setQuery(details.query)}
    >
      <XhMentionLabel>评论</XhMentionLabel>
      <XhMentionInput as="textarea" rows={3} />
      <XhMentionPositioner>
        <XhMentionContent>
          {filtered.map(p => (
            <XhMentionItem key={p.value} value={p.value}>
              <XhMentionItemText>{p.label}</XhMentionItemText>
            </XhMentionItem>
          ))}
        </XhMentionContent>
      </XhMentionPositioner>
    </XhMentionRoot>
  );
}
`;export{e as default};