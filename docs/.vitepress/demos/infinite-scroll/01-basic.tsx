// 基础用法 | 哨兵滚进可视区就派 load，取完把 loading 写回 false
import type { ReactNode } from "react";
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [items, setItems] = useState(() =>
    Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 条`),
  );
  const [loading, setLoading] = useState(false);

  // 取下一页；这里用定时器代替真实请求
  function onLoad(): void {
    setLoading(true);
    window.setTimeout(() => {
      setItems(list => [
        ...list,
        ...Array.from({ length: 8 }, (_, i) => `第 ${list.length + i + 1} 条`),
      ]);
      setLoading(false);
    }, 500);
  }

  return (
    <div
      ref={setScrollEl}
      style={{
        blockSize: "240px",
        overflow: "auto",
        border: "1px solid var(--xh-border-default)",
        borderRadius: "8px",
      }}
    >
      {/* target 指向真正在滚的那层；不给就以窗口视口为准 */}
      <XhInfiniteScrollRoot target={scrollEl} loading={loading} onLoad={onLoad}>
        {items.map(item => (
          <div key={item} style={{ padding: "8px 12px" }}>{item}</div>
        ))}
        {loading && (
          <p style={{ margin: 0, padding: "8px 12px", color: "var(--xh-fg-muted)" }}>
            正在取下一页…
          </p>
        )}
        {/* 哨兵摆在列表最后一条之后 */}
        <XhInfiniteScrollSentinel />
      </XhInfiniteScrollRoot>
    </div>
  );
}
