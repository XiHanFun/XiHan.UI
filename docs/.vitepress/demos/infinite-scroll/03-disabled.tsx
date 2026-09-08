// 取到没有了 | 最后一页取完把 disabled 打开，哨兵不再被观察，load 也不再派
import type { ReactNode } from "react";
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/react";
import { useState } from "react";

const maxPage = 3;

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(() =>
    Array.from({ length: 10 }, (_, i) => `第 ${i + 1} 条`),
  );
  const [loading, setLoading] = useState(false);

  function onLoad(): void {
    setLoading(true);
    window.setTimeout(() => {
      setItems(list => [
        ...list,
        ...Array.from({ length: 6 }, (_, i) => `第 ${list.length + i + 1} 条`),
      ]);
      setPage(n => n + 1);
      setLoading(false);
    }, 400);
  }

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <div
        ref={setScrollEl}
        style={{
          blockSize: "220px",
          overflow: "auto",
          border: "1px solid var(--xh-border-default)",
          borderRadius: "8px",
        }}
      >
        <XhInfiniteScrollRoot
          target={scrollEl}
          loading={loading}
          disabled={page >= maxPage}
          onLoad={onLoad}
        >
          {items.map(item => (
            <div key={item} style={{ padding: "8px 12px" }}>{item}</div>
          ))}
          {loading
            ? (
                <p style={{ margin: 0, padding: "8px 12px", color: "var(--xh-fg-muted)" }}>
                  正在取下一页…
                </p>
              )
            : page >= maxPage
              ? (
                  <p style={{ margin: 0, padding: "8px 12px", color: "var(--xh-fg-muted)" }}>
                    没有更多了
                  </p>
                )
              : null}
          <XhInfiniteScrollSentinel />
        </XhInfiniteScrollRoot>
      </div>

      <span>{`第 ${page} / ${maxPage} 页 · 共 ${items.length} 条`}</span>
    </div>
  );
}
