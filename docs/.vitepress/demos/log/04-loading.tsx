// 取行中 | loading 让日志区报 aria-busy 并把指针换成忙碌态；「正在拉取」那一行是作者自己渲的
import type { ReactNode } from "react";
import { XhButton, XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [lines, setLines] = useState([
    "12:00:01  boot   服务已启动",
    "12:00:02  db     连接池就绪",
    "12:00:03  http   GET /health  200",
  ]);
  const [loading, setLoading] = useState(false);

  // 取回来的一批行追加在后面，取的过程里 loading 立着
  function fetchMore(): void {
    if (loading) {
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLines((prev) => {
        const base = prev.length;
        const more = Array.from(
          { length: 5 },
          (_, i) => `12:00:0${base + i + 1}  http   GET /api/items/${1000 + base + i + 1}  200`,
        );
        return [...prev, ...more];
      });
      setLoading(false);
    }, 1200);
  }

  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhLogRoot rows={7} loading={loading}>
        <XhLogViewport>
          <XhLogContent>
            {lines.map((line, i) => <XhLogLine key={i}>{line}</XhLogLine>)}
            {loading ? <XhLogLine style={{ color: "var(--xh-fg-muted)" }}>正在拉取下一批…</XhLogLine> : null}
          </XhLogContent>
        </XhLogViewport>
      </XhLogRoot>

      <div>
        <XhButton variant="solid" disabled={loading} onClick={fetchMore}>再取 5 行</XhButton>
      </div>
    </div>
  );
}
