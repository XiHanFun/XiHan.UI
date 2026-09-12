// 基础用法 | 滚过判定线就把内容钉在滚动容器可视区的上边；占位盒留在原位，页面不跳
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
      <p style={{ blockSize: "120px" }}>往下滚，下面那条会钉在容器顶边。</p>

      {/* target 指向真正在滚的那层；不给就按整页滚动算 */}
      <XhAffixRoot target={scrollEl}>
        <XhAffixContent
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            background: "var(--xh-bg-brand)",
            color: "var(--xh-fg-on-brand)",
          }}
        >
          我会钉在顶边
        </XhAffixContent>
      </XhAffixRoot>

      <p style={{ blockSize: "600px" }}>后面还有很长的内容，一直滚到底再滚回去。</p>
    </div>
  );
}
