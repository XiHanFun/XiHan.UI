// 判定线偏移 | offset 是判定线距容器视口顶边的距离，有吸顶栏就把栏高填进去，越过它的最后一节才算当前节
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
  { value: "anchor-offset-a", label: "第一节" },
  { value: "anchor-offset-b", label: "第二节" },
  { value: "anchor-offset-c", label: "第三节" },
];

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: "20px",
  inlineSize: "100%",
  alignItems: "start",
};

const scroller: CSSProperties = {
  position: "relative",
  blockSize: "240px",
  overflow: "auto",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};

// 44px 高的吸顶栏，判定线正好压在它下沿
const stickyBar: CSSProperties = {
  position: "sticky",
  insetBlockStart: 0,
  zIndex: 1,
  blockSize: "44px",
  display: "flex",
  alignItems: "center",
  paddingInline: "12px",
  background: "var(--xh-bg-surface)",
  borderBlockEnd: "1px solid var(--xh-border-default)",
};

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  return (
    <div style={layout}>
      <XhAnchorRoot scrollElement={scrollEl} offset={44} smooth>
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
        <div style={stickyBar}>吸顶栏（44px）</div>

        {sections.map(s => (
          <div key={s.value} id={s.value} style={{ blockSize: "180px", padding: "12px" }}>
            <strong>{s.label}</strong>
            <p>这一节被吸顶栏挡住时不算当前节。</p>
          </div>
        ))}
      </div>
    </div>
  );
}
