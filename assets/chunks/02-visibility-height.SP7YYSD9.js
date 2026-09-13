const n=`// 显示阈值 | 提前显示回到顶部按钮
import type { CSSProperties, ReactNode } from "react";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/react";
import { useRef } from "react";

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
        style={{
          blockSize: "220px",
          overflow: "auto",
          paddingInline: "16px",
          borderRadius: "var(--xh-shape-surface)",
          background: "var(--xh-bg-subtle)",
        }}
      >
        {["快速开始", "基础配置", "主题定制", "部署"].map(section => (
          <section key={section} style={{ minBlockSize: "88px", paddingBlock: "14px" }}>
            <strong>{section}</strong>
            <p style={{ color: "var(--xh-fg-muted)" }}>{\`\${section}相关内容\`}</p>
          </section>
        ))}
      </div>

      <XhBackTopRoot target={() => scrollEl.current} visibilityHeight={48} style={rootStyle}>
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  );
}
`;export{n as default};
