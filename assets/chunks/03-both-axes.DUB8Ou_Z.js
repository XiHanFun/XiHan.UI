const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 双轴滚动 | 同时显示横向和纵向滚动条
import type { ReactNode } from "react";
import { XhScrollbarCorner, XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/react";
import { useRef } from "react";

const rows = Array.from({ length: 30 }, (_, r) => Array.from({ length: 12 }, (_, c) => \`\${r + 1}-\${c + 1}\`));

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
`;export{n as default};
