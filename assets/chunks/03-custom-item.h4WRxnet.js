const n=`// 候选里的自定义内容 | 手写各部件即可在候选行里放头像与职位；插回正文的那段字取自 item-text
import type { ReactNode } from "react";
import {
  XhAvatarFallback,
  XhAvatarRoot,
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionPositioner,
  XhMentionRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const people = [
  { value: "lilei", label: "李雷", role: "前端", initials: "李" },
  { value: "hanmeimei", label: "韩梅梅", role: "设计", initials: "韩" },
  { value: "poly", label: "Poly", role: "后端", initials: "P" },
];

export default function Demo(): ReactNode {
  const [text, setText] = useState("");
  const [query, setQuery] = useState<string | null>(null);

  const q = (query ?? "").trim().toLowerCase();
  const filtered = q === ""
    ? people
    : people.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));

  return (
    <>
      <XhMentionRoot
        value={text}
        onValueChange={details => setText(details.value)}
        translations={{ content: "提及谁" }}
        onQueryChange={details => setQuery(details.query)}
      >
        <XhMentionInput aria-label="正文" placeholder="输入 @ 提及同事" />
        <XhMentionPositioner>
          <XhMentionContent>
            {filtered.map(p => (
              <XhMentionItem key={p.value} value={p.value}>
                <XhAvatarRoot size="sm">
                  <XhAvatarFallback>{p.initials}</XhAvatarFallback>
                </XhAvatarRoot>
                {/* 只有 item-text 里的字会被插进正文，职位不会跟着进去 */}
                <XhMentionItemText>{p.label}</XhMentionItemText>
                <span style={{ color: "var(--xh-fg-subtle)", fontSize: "var(--xh-font-size-xs)" }}>
                  {p.role}
                </span>
              </XhMentionItem>
            ))}
          </XhMentionContent>
        </XhMentionPositioner>
      </XhMentionRoot>
      <p>{\`正文：\${text || "（空）"}\`}</p>
    </>
  );
}
`;export{n as default};
