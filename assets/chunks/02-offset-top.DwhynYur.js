const n=`// 顶部偏移 | 避让固定页头
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
        position: "relative",
        blockSize: "240px",
        inlineSize: "min(420px, 100%)",
        overflow: "auto",
        padding: "12px",
        borderRadius: "var(--xh-shape-surface)",
        background: "var(--xh-bg-subtle)",
      }}
    >
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

      <div style={{ blockSize: "120px" }} />

      <XhAffixRoot target={() => scrollEl.current} offsetTop={40}>
        <XhAffixContent
          style={{
            padding: "8px 12px",
            borderRadius: "var(--xh-shape-control)",
            background: "var(--xh-bg-brand-subtle)",
            color: "var(--xh-fg-brand)",
          }}
        >
          二级工具栏
        </XhAffixContent>
      </XhAffixRoot>

      <div style={{ blockSize: "600px" }} />
    </div>
  );
}
`;export{n as default};
