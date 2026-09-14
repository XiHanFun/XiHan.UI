// 与无限滚动合成一条长列表 | 哨兵摆在内容层之后而不是条目之间：窗口外的条目根本没渲染，摆进去的哨兵永远进不了可视区
import type { CSSProperties, ReactNode } from "react";
import {
  XhInfiniteScrollLoadMoreTrigger,
  XhInfiniteScrollRoot,
  XhInfiniteScrollSentinel,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

const PAGE = 100;
const TOTAL = 400;

const rootStyle: CSSProperties = {
  blockSize: "260px",
  inlineSize: "100%",
  maxInlineSize: "420px",
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  blockSize: "36px",
  paddingInline: "var(--xh-space-3)",
  borderBlockEnd: "var(--xh-stroke-thin) solid var(--xh-border-subtle)",
};

const moreStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--xh-space-2)",
  padding: "var(--xh-space-3)",
  color: "var(--xh-fg-muted)",
  fontSize: "var(--xh-font-size-sm)",
};

export default function Demo(): ReactNode {
  const [loaded, setLoaded] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // 滚动的是视口那一层，提前量按它算；哨兵在同一层里才量得到自己进没进可视区
  const [viewport, setViewport] = useState<HTMLElement | null>(null);

  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function onLoad(): void {
    if (loading || done) {
      return;
    }
    setLoading(true);
    timer.current = window.setTimeout(() => {
      const next = Math.min(loaded + PAGE, TOTAL);
      setLoaded(next);
      setDone(next >= TOTAL);
      setLoading(false);
    }, 600);
  }

  return (
    <XhVirtualizerRoot count={loaded} estimateSize={36} style={rootStyle}>
      {({ virtualItems }) => (
        <XhVirtualizerViewport ref={setViewport}>
          <XhVirtualizerContent>
            {virtualItems.map(item => (
              <XhVirtualizerItem key={item.key} value={item.index} style={rowStyle}>
                {`第 ${item.index + 1} 条`}
              </XhVirtualizerItem>
            ))}
          </XhVirtualizerContent>

          {/* 内容层撑的是已取到的这几页的总长，哨兵紧跟其后，正好落在列表末尾 */}
          <XhInfiniteScrollRoot
            target={viewport}
            loading={loading}
            disabled={done}
            style={moreStyle}
            onLoad={onLoad}
          >
            {loading ? <span>正在取下一页…</span> : null}
            {!loading && done ? <span>{`没有更多了，共 ${TOTAL} 条`}</span> : null}
            {/* 读屏在虚拟光标模式下不产生滚动事件，这颗按钮是哨兵那条路的键盘等价通路 */}
            {!loading && !done ? <XhInfiniteScrollLoadMoreTrigger>取下一页</XhInfiniteScrollLoadMoreTrigger> : null}
            <XhInfiniteScrollSentinel />
          </XhInfiniteScrollRoot>
        </XhVirtualizerViewport>
      )}
    </XhVirtualizerRoot>
  );
}
