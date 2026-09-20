const n=`// 判定线偏移 | 为吸顶内容预留空间
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
  { value: "anchor-offset-a", label: "第一节" },
  { value: "anchor-offset-b", label: "第二节" },
  { value: "anchor-offset-c", label: "第三节" },
];

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(112px, 140px) minmax(0, 1fr)",
  gap: "20px",
  inlineSize: "min(640px, 100%)",
  alignItems: "start",
};

const scroller: CSSProperties = {
  position: "relative",
  blockSize: "240px",
  overflow: "auto",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
};

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
  const scrollEl = useRef<HTMLDivElement>(null);

  return (
    <div style={layout}>
      <XhAnchorRoot scrollElement={() => scrollEl.current} offset={44} smooth>
        <XhAnchorList>
          {sections.map(s => (
            <XhAnchorItem key={s.value}>
              <XhAnchorLink value={s.value}>{s.label}</XhAnchorLink>
            </XhAnchorItem>
          ))}
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>

      <div ref={scrollEl} data-xh-scroll="" style={scroller}>
        <div style={stickyBar}>章节导航</div>

        {sections.map(s => (
          <div key={s.value} id={s.value} style={{ blockSize: "180px", padding: "12px" }}>
            <strong>{s.label}</strong>
            <p style={{ color: "var(--xh-fg-muted)" }}>{\`\${s.label}相关内容\`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
`;export{n as default};
