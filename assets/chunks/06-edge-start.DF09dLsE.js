var e=`// 往前翻历史 | edge 设为 start：哨兵摆在列表开头，更早的消息插在前面，取数期间视口不跳
import type { ReactNode } from "react";
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/react";
import { useLayoutEffect, useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const oldest = useRef(100);
  const [messages, setMessages] = useState(() => Array.from({ length: 12 }, (_, i) => \`消息 \${100 + i}\`));
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // 从最新一条看起
  useLayoutEffect(() => {
    if (scrollEl)
      scrollEl.scrollTop = scrollEl.scrollHeight;
  }, [scrollEl]);

  // 取更早的一页；这里用定时器代替真实请求。loading 要如实写：组件靠它知道什么时候守住视口
  const onLoad = (): void => {
    setLoading(true);
    window.setTimeout(() => {
      const start = oldest.current - 8;
      oldest.current = start;
      setMessages(current => [...Array.from({ length: 8 }, (_, i) => \`消息 \${start + i}\`), ...current]);
      setLoading(false);
      setDone(start <= 60);
    }, 500);
  };

  return (
    <div
      ref={setScrollEl}
      data-xh-scroll
      style={{
        blockSize: 240,
        overflow: "auto",
        border: "1px solid var(--xh-border-default)",
        borderRadius: 8,
      }}
    >
      <XhInfiniteScrollRoot edge="start" target={scrollEl} loading={loading} disabled={done} onLoad={onLoad}>
        {/* 哨兵摆在第一条之前 */}
        <XhInfiniteScrollSentinel />
        <p style={{ margin: 0, padding: "8px 12px", color: "var(--xh-fg-muted)" }}>
          {done ? "没有更早的消息了" : loading ? "正在取更早的消息…" : "往上翻取更早的消息"}
        </p>
        {messages.map(message => (
          <div key={message} style={{ padding: "8px 12px" }}>{message}</div>
        ))}
      </XhInfiniteScrollRoot>
    </div>
  );
}
`;export{e as default};