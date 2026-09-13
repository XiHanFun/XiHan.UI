/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 横向排列 | 在内容上方显示章节导航
import type { CSSProperties, ReactNode } from "react";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/react";
import { useRef } from "react";

const sections = [
  { value: "anchor-h-overview", label: "概览" },
  { value: "anchor-h-props", label: "属性" },
  { value: "anchor-h-events", label: "事件" },
  { value: "anchor-h-slots", label: "插槽" },
];

const scroller: CSSProperties = {
  blockSize: "220px",
  overflow: "auto",
  paddingInline: "12px",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
};

export default function Demo(): ReactNode {
  const scrollEl = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "min(640px, 100%)" }}>
      <XhAnchorRoot scrollElement={() => scrollEl.current} orientation="horizontal" smooth>
        <XhAnchorList>
          {sections.map(s => (
            <XhAnchorItem key={s.value}>
              <XhAnchorLink value={s.value}>{s.label}</XhAnchorLink>
            </XhAnchorItem>
          ))}
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>

      <div ref={scrollEl} style={scroller}>
        {sections.map(s => (
          <div key={s.value} id={s.value} style={{ blockSize: "170px", paddingBlock: "12px" }}>
            <strong>{s.label}</strong>
            <p style={{ color: "var(--xh-fg-muted)" }}>{`${s.label}相关内容`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
