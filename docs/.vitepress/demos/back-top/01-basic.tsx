// 基础用法 | 滚动后显示回到顶部按钮
import type { CSSProperties, ReactNode } from "react";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/react";
import { useRef } from "react";

const sections = ["概览", "安装", "主题", "发布"];

const rootStyle = {
  "position": "absolute",
  "--xh-back-top-inset-block": "12px",
  "--xh-back-top-inset-inline": "12px",
} as CSSProperties;

export default function Demo(): ReactNode {
  const scrollEl = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: "relative", inlineSize: "min(560px, 100%)" }}>
      <div
        ref={scrollEl}
        data-xh-scroll=""
        style={{
          blockSize: "240px",
          overflow: "auto",
          paddingInline: "16px",
          borderRadius: "var(--xh-shape-surface)",
          background: "var(--xh-bg-subtle)",
        }}
      >
        {sections.map(section => (
          <section key={section} style={{ minBlockSize: "104px", paddingBlock: "16px" }}>
            <strong>{section}</strong>
            <p style={{ color: "var(--xh-fg-muted)" }}>{`${section}相关内容`}</p>
          </section>
        ))}
      </div>

      <XhBackTopRoot target={() => scrollEl.current} visibilityHeight={120} style={rootStyle}>
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  );
}
