// 贴下边 | 给了 offset-bottom 就改贴可视区的下边，判定线也换到下边
import type { ReactNode } from "react";
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  return (
    <div
      ref={setScrollEl}
      style={{
        blockSize: "240px",
        overflow: "auto",
        padding: "12px",
        border: "1px solid var(--xh-border-default)",
        borderRadius: "8px",
      }}
    >
      <p style={{ blockSize: "80px" }}>这块工具条在滚到它之前就贴在容器底边，滚过去之后回到常规流。</p>

      <XhAffixRoot target={scrollEl} offsetBottom={12}>
        <XhAffixContent
          style={{
            display: "flex",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "6px",
            background: "var(--xh-bg-surface-raised)",
            boxShadow: "var(--xh-elevation-floating)",
          }}
        >
          <span>共 42 项</span>
          <span>已选 3 项</span>
        </XhAffixContent>
      </XhAffixRoot>

      <p style={{ blockSize: "600px" }}>下面是很长的列表内容。</p>
    </div>
  );
}
