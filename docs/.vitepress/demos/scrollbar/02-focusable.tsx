// 键盘操作 | 让滑块可聚焦
import type { ReactNode } from "react";
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/react";
import { useRef } from "react";

const cells = Array.from({ length: 24 }, (_, i) => `第 ${i + 1} 列`);

const boxStyle = {
  overflow: "auto",
  scrollbarWidth: "none",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "var(--xh-shape-surface)",
  padding: "8px",
} as const;

const cellStyle = {
  padding: "6px 12px",
  borderRadius: "var(--xh-shape-control)",
  background: "var(--xh-bg-subtle)",
  whiteSpace: "nowrap",
} as const;

export default function Demo(): ReactNode {
  const box = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: "relative", inlineSize: "320px" }}>
      <div id="scrollbar-focusable-box" ref={box} style={boxStyle}>
        <div style={{ display: "flex", gap: "8px", inlineSize: "max-content" }}>
          {cells.map(cell => (
            <div key={cell} style={cellStyle}>{cell}</div>
          ))}
        </div>
      </div>

      <XhScrollbarRoot
        scrollable={() => box.current}
        controls="scrollbar-focusable-box"
        orientation="horizontal"
        type="always"
        size="lg"
        focusable
        translations={{ thumb: "横向滚动条" }}
      >
        <XhScrollbarTrack>
          <XhScrollbarThumb />
        </XhScrollbarTrack>
      </XhScrollbarRoot>
    </div>
  );
}
