// 数据写法 | 只给 collection、不写结构时按标准结构铺：一条一个链接，文字取 label，末尾带滑动的指示条
import type { CSSProperties, ReactNode } from "react";
import { XhAnchorRoot } from "@xihan-ui/react";
import { useRef } from "react";

const sections = [
  { value: "anchor-data-overview", label: "概览" },
  { value: "anchor-data-install", label: "安装" },
  { value: "anchor-data-theme", label: "主题" },
  { value: "anchor-data-release", label: "发布" },
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
      <XhAnchorRoot collection={sections} target={() => scrollEl.current} smooth />

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
