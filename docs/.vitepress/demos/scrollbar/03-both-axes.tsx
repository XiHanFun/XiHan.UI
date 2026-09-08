// 横竖两条 | 同一个容器挂两条，gutter 让各自在末端让出交叉口，XhScrollbarCorner 把那一格补上
import type { ReactNode } from "react";
import { XhScrollbarCorner, XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/react";
import { useRef } from "react";

const rows = Array.from({ length: 30 }, (_, r) => Array.from({ length: 12 }, (_, c) => `${r + 1}-${c + 1}`));

const boxStyle = {
  blockSize: "200px",
  overflow: "auto",
  scrollbarWidth: "none",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "var(--xh-shape-surface)",
  padding: "8px",
} as const;

const cellStyle = {
  inlineSize: "56px",
  color: "var(--xh-fg-muted)",
  fontVariantNumeric: "tabular-nums",
};

export default function Demo(): ReactNode {
  const box = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: "relative", inlineSize: "320px" }}>
      <div ref={box} style={boxStyle}>
        {rows.map((row, r) => (
          <div
            key={r}
            style={{ display: "flex", gap: "8px", inlineSize: "max-content", paddingBlock: "2px" }}
          >
            {row.map(cell => (
              <span key={cell} style={cellStyle}>{cell}</span>
            ))}
          </div>
        ))}
      </div>

      {/* 交叉口补丁写在其中一条里即可，跟着这一条显隐 */}
      <XhScrollbarRoot scrollable={() => box.current} type="auto" gutter>
        <XhScrollbarTrack>
          <XhScrollbarThumb />
        </XhScrollbarTrack>
        <XhScrollbarCorner />
      </XhScrollbarRoot>
      <XhScrollbarRoot scrollable={() => box.current} type="auto" orientation="horizontal" gutter>
        <XhScrollbarTrack>
          <XhScrollbarThumb />
        </XhScrollbarTrack>
      </XhScrollbarRoot>
    </div>
  );
}
