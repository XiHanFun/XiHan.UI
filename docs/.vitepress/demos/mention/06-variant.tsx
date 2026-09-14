// 形态 | variant 换正文框的描边与底色，候选面板不受影响
import type { ReactNode } from "react";
import { XhMentionRoot } from "@xihan-ui/react";
import { useState } from "react";

const people = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
];

const variants = ["outline", "subtle", "ghost"] as const;

export default function Demo(): ReactNode {
  const [query, setQuery] = useState<string | null>(null);

  const q = (query ?? "").trim().toLowerCase();
  const filtered = q === ""
    ? people
    : people.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {variants.map(variant => (
        <XhMentionRoot
          key={variant}
          variant={variant}
          collection={filtered}
          placeholder={`${variant} 档，输入 @ 提及同事`}
          translations={{ input: "正文", content: "提及谁" }}
          onQueryChange={details => setQuery(details.query)}
        />
      ))}
    </div>
  );
}
