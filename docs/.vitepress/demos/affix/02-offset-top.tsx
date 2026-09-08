// 让出吸顶栏 | offset-top 把判定线往下挪，钉住后也在同一位置留出这段高度
import type { ReactNode } from "react";
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  return (
    <div
      ref={setScrollEl}
      style={{
        position: "relative",
        blockSize: "240px",
        overflow: "auto",
        padding: "12px",
        border: "1px solid var(--xh-border-default)",
        borderRadius: "8px",
      }}
    >
      {/* 容器自带一条 40px 的吸顶栏，钉住的内容要躲开它 */}
      <div
        style={{
          position: "sticky",
          insetBlockStart: 0,
          zIndex: 1,
          blockSize: "40px",
          display: "flex",
          alignItems: "center",
          paddingInline: "8px",
          background: "var(--xh-bg-subtle)",
        }}
      >
        吸顶栏
      </div>

      <p style={{ blockSize: "120px" }}>往下滚。</p>

      <XhAffixRoot target={scrollEl} offsetTop={40}>
        <XhAffixContent
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            background: "var(--xh-bg-brand)",
            color: "var(--xh-fg-on-brand)",
          }}
        >
          钉在吸顶栏下方 40px 处
        </XhAffixContent>
      </XhAffixRoot>

      <p style={{ blockSize: "600px" }}>后面还有很长的内容。</p>
    </div>
  );
}
