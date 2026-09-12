// 三种相位 | 空、在途、还有更多各有部件：给了 collection 时前两者的收放归组件，取下一页那颗钮点了做什么归你
import type { ReactNode } from "react";
import {
  XhListboxContent,
  XhListboxEmpty,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxLoading,
  XhListboxLoadMoreTrigger,
  XhListboxRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const pool = [
  { value: "liuyi", label: "刘一" },
  { value: "chener", label: "陈二" },
  { value: "zhangsan", label: "张三" },
  { value: "lisi", label: "李四" },
  { value: "wangwu", label: "王五" },
  { value: "zhaoliu", label: "赵六" },
];

export default function Demo(): ReactNode {
  const [members, setMembers] = useState(pool.slice(0, 3));
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  function loadMore(): void {
    setLoading(true);
    window.setTimeout(() => {
      setMembers(previous => pool.slice(0, previous.length + 3));
      setLoading(false);
    }, 600);
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxInlineSize: "320px" }}>
        <XhListboxRoot
          value={picked}
          onValueChange={details => setPicked(details.value)}
          collection={members}
          loading={loading}
        >
          <XhListboxLabel>成员</XhListboxLabel>
          <XhListboxContent>
            {members.map(m => (
              <XhListboxItem key={m.value} value={m.value}>
                <XhListboxItemText>{m.label}</XhListboxItemText>
                <XhListboxItemIndicator />
              </XhListboxItem>
            ))}
          </XhListboxContent>
          <XhListboxEmpty>还没有成员，先取一页试试</XhListboxEmpty>
          <XhListboxLoading>正在取成员…</XhListboxLoading>
          {members.length < pool.length && (
            <XhListboxLoadMoreTrigger onClick={loadMore}>
              取下一页
            </XhListboxLoadMoreTrigger>
          )}
        </XhListboxRoot>
        <button type="button" onClick={() => setMembers([])}>清空</button>
      </div>
      <p>{`已选：${picked.length ? picked.join("、") : "（无）"}`}</p>
    </>
  );
}
