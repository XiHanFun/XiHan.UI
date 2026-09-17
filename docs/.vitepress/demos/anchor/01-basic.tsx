// 基础用法 | 跟随滚动高亮当前章节
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
  { value: "anchor-basic-overview", label: "概览" },
  { value: "anchor-basic-install", label: "安装" },
  { value: "anchor-basic-theme", label: "主题" },
  { value: "anchor-basic-release", label: "发布" },
];

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(112px, 140px) minmax(0, 1fr)",
  gap: "20px",
  inlineSize: "min(640px, 100%)",
  alignItems: "start",
};

const scroller: CSSProperties = {
  blockSize: "240px",
  overflow: "auto",
  paddingInline: "12px",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
};

export default function Demo(): ReactNode {
  const scrollEl = useRef<HTMLDivElement>(null);

  return (
    <div style={layout}>
      <XhAnchorRoot scrollElement={() => scrollEl.current} smooth>
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
        {sections.map(s => (
          <div key={s.value} id={s.value} style={{ blockSize: "160px", paddingBlock: "12px" }}>
            <strong>{s.label}</strong>
            <p style={{ color: "var(--xh-fg-muted)" }}>{`${s.label}相关内容`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
