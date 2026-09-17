// 吸附状态 | 根据当前状态更新内容
import type { ReactNode } from "react";
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/react";
import { useRef } from "react";

export default function Demo(): ReactNode {
  const scrollEl = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "min(420px, 100%)" }}>
      <div
        ref={scrollEl}
        data-xh-scroll=""
        style={{
          blockSize: "220px",
          overflow: "auto",
          padding: "12px",
          borderRadius: "var(--xh-shape-surface)",
          background: "var(--xh-bg-subtle)",
        }}
      >
        <div style={{ blockSize: "120px" }} />

        <XhAffixRoot
          target={() => scrollEl.current}
        >
          {({ affixed: pinned }) => (
            <XhAffixContent
              style={{ padding: "8px 12px", borderRadius: "var(--xh-shape-control)", background: "var(--xh-bg-surface-raised)" }}
            >
              {pinned ? "已固定" : "工具栏"}
            </XhAffixContent>
          )}
        </XhAffixRoot>

        <div style={{ blockSize: "600px" }} />
      </div>
    </div>
  );
}
