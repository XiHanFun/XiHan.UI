// 异步候选 | 查询串每变一次就重新去远端查一遍，加载、空结果和候选共用一张浮层表面
import type { ReactNode } from "react";
import {
  XhMentionContent,
  XhMentionEmpty,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionLoading,
  XhMentionPositioner,
  XhMentionRoot,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Person {
  value: string;
  label: string;
}

const pool: Person[] = [
  { value: "lilei", label: "李雷" },
  { value: "hanmeimei", label: "韩梅梅" },
  { value: "poly", label: "Poly" },
  { value: "linfeng", label: "林枫" },
];

export default function Demo(): ReactNode {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(0);

  // 每次查询串变化都重开一轮查询，上一轮未落地的先撤掉
  function onQuery(details: { query: string | null }): void {
    window.clearTimeout(timer.current);
    if (details.query === null) {
      setOptions([]);
      setLoading(false);
      return;
    }
    const q = details.query.trim().toLowerCase();
    setOptions([]);
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setOptions(pool.filter(p => p.value.includes(q) || p.label.toLowerCase().includes(q)));
      setLoading(false);
    }, 500);
  }

  return (
    <>
      <XhMentionRoot
        value={text}
        onValueChange={details => setText(details.value)}
        collection={options}
        loading={loading}
        placeholder="输入 @ 再打两个字试试"
        translations={{ input: "正文", content: "提及谁" }}
        onQueryChange={onQuery}
      >
        <XhMentionInput />
        <XhMentionPositioner>
          <XhMentionContent>
            {options.map(person => (
              <XhMentionItem key={person.value} value={person.value}>
                <XhMentionItemText>{person.label}</XhMentionItemText>
              </XhMentionItem>
            ))}
          </XhMentionContent>
          <XhMentionEmpty>没有匹配的人选</XhMentionEmpty>
          <XhMentionLoading>查询中…</XhMentionLoading>
        </XhMentionPositioner>
      </XhMentionRoot>
      <p>{loading ? "查询中…" : `候选 ${options.length} 条`}</p>
    </>
  );
}
