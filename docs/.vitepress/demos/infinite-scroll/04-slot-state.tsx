// 状态透出 | phase / loading / disabled 由组件交给宿主，加载提示与结束语都由宿主自己摆
import type { ReactNode } from "react";
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [items, setItems] = useState(() =>
    Array.from({ length: 10 }, (_, i) => `第 ${i + 1} 条`),
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function onLoad(): void {
    setLoading(true);
    window.setTimeout(() => {
      setItems((list) => {
        const next = [
          ...list,
          ...Array.from({ length: 6 }, (_, i) => `第 ${list.length + i + 1} 条`),
        ];
        setDone(next.length >= 28);
        return next;
      });
      setLoading(false);
    }, 400);
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
      <XhInfiniteScrollRoot
        target={scrollEl}
        loading={loading}
        disabled={done}
        onLoad={onLoad}
      >
        {({ phase, loading: busy, disabled }) => (
          <>
            {items.map(item => (
              <div key={item} style={{ padding: "8px 12px" }}>{item}</div>
            ))}

            <p style={{ margin: 0, padding: "8px 12px", color: "var(--xh-fg-muted)" }}>
              {busy
                ? "正在取下一页…"
                : disabled
                  ? "没有更多了"
                  : `继续往下滚（当前 ${phase}）`}
            </p>

            <XhInfiniteScrollSentinel />
          </>
        )}
      </XhInfiniteScrollRoot>
    </div>
  );
}
