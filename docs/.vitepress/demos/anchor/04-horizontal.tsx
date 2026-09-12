// 横排目录 | orientation="horizontal" 只改样式：条目排成一行，轨道与指示条从起始缘挪到底边
import type { CSSProperties, ReactNode } from "react";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const sections = [
  { value: "anchor-h-overview", label: "概览" },
  { value: "anchor-h-props", label: "属性" },
  { value: "anchor-h-events", label: "事件" },
  { value: "anchor-h-slots", label: "插槽" },
];

const scroller: CSSProperties = {
  blockSize: "220px",
  overflow: "auto",
  padding: "12px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <XhAnchorRoot scrollElement={scrollEl} orientation="horizontal" smooth>
        <XhAnchorList>
          {sections.map(s => (
            <XhAnchorItem key={s.value}>
              <XhAnchorLink value={s.value}>{s.label}</XhAnchorLink>
            </XhAnchorItem>
          ))}
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>

      <div ref={setScrollEl} style={scroller}>
        {sections.map(s => (
          <div key={s.value} id={s.value} style={{ blockSize: "170px" }}>
            <strong>{s.label}</strong>
            <p>这一节的正文。</p>
          </div>
        ))}
      </div>
    </div>
  );
}
