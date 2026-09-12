// 远程检索 | filter 关掉：交进来的 collection 就是此刻该显示的那几条，筛选归服务端；取数期间 loading 让在途占位顶上来、列表压暗一档，空态让位
import type { CommandNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhCommandContent,
  XhCommandEmpty,
  XhCommandFooter,
  XhCommandInput,
  XhCommandItem,
  XhCommandItemText,
  XhCommandList,
  XhCommandLoading,
  XhCommandRoot,
  XhCommandTrigger,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

// 站在服务端那一头的整份名册，示例里用一次延迟冒充网络
const roster = [
  { value: "zhangsan", label: "张三 · 平台组" },
  { value: "lisi", label: "李四 · 平台组" },
  { value: "wangwu", label: "王五 · 交易组" },
  { value: "zhaoliu", label: "赵六 · 交易组" },
  { value: "sunqi", label: "孙七 · 风控组" },
];

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CommandNode[]>(roster.slice(0, 3));
  const [picked, setPicked] = useState("还没选过人");

  // 回来的顺序不保证与发出的顺序一致，只认最后一次请求的结果
  const latest = useRef(0);

  useEffect(() => {
    setLoading(true);
    const seq = ++latest.current;
    const timer = window.setTimeout(() => {
      if (seq !== latest.current) {
        return;
      }
      const text = query.trim();
      setResults(text ? roster.filter(one => one.label.includes(text)) : roster.slice(0, 3));
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <XhCommandRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        inputValue={query}
        onInputValueChange={details => setQuery(details.inputValue)}
        collection={results}
        filter={false}
        loading={loading}
        placeholder="搜同事…"
        onSelect={details => setPicked(`选了：${details.label}`)}
      >
        <XhCommandTrigger>找一个人</XhCommandTrigger>
        <XhCommandContent>
          <XhCommandInput />
          {/* 交进来的就是该显示的那几条，这里照单铺开 */}
          <XhCommandList>
            {results.map(one => (
              <XhCommandItem key={one.value} value={one.value}>
                <XhCommandItemText>{one.label}</XhCommandItemText>
              </XhCommandItem>
            ))}
          </XhCommandList>
          <XhCommandEmpty>名册里没有这个人</XhCommandEmpty>
          <XhCommandLoading>正在从服务端取…</XhCommandLoading>
          <XhCommandFooter>不输字时给的是最近协作过的三位</XhCommandFooter>
        </XhCommandContent>
      </XhCommandRoot>
      <span>{picked}</span>
    </div>
  );
}
