// 基础用法 | 滚动后固定工具栏
import type { ReactNode } from "react";
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/react";
import { useRef } from "react";

export default function Demo(): ReactNode {
  const scrollEl = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollEl}
      data-xh-scroll=""
      style={{
        blockSize: "240px",
        inlineSize: "min(420px, 100%)",
        overflow: "auto",
        padding: "12px",
        borderRadius: "var(--xh-shape-surface)",
        background: "var(--xh-bg-subtle)",
      }}
    >
      <div style={{ blockSize: "120px", padding: "8px" }}>项目概览</div>

      <XhAffixRoot target={() => scrollEl.current}>
        <XhAffixContent
          style={{
            padding: "8px 12px",
            borderRadius: "var(--xh-shape-control)",
            background: "var(--xh-bg-brand-subtle)",
            color: "var(--xh-fg-brand)",
          }}
        >
          筛选与操作
        </XhAffixContent>
      </XhAffixRoot>

      <div style={{ blockSize: "600px", padding: "12px" }}>
        项目动态
        <br />
        <br />
        最近访问
        <br />
        <br />
        团队成员
      </div>
    </div>
  );
}
