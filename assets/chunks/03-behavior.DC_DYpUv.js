const o=`// 滚动方式 | behavior=auto 一步跳回顶部，smooth 平滑滚过去
import type { CSSProperties, ReactNode } from "react";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/react";
import { useState } from "react";

const boxStyle: CSSProperties = {
  blockSize: "200px",
  overflow: "auto",
  padding: "12px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};

const rootStyle = {
  "position": "absolute",
  "--xh-back-top-inset-block": "12px",
  "--xh-back-top-inset-inline": "12px",
} as CSSProperties;

export default function Demo(): ReactNode {
  const [smoothEl, setSmoothEl] = useState<HTMLElement | null>(null);
  const [autoEl, setAutoEl] = useState<HTMLElement | null>(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", inlineSize: "100%" }}>
      <div style={{ position: "relative" }}>
        <div ref={setSmoothEl} style={boxStyle}>
          {Array.from({ length: 16 }, (_, i) => i + 1).map(i => (
            <p key={i} style={{ margin: "0 0 12px" }}>{\`smooth · 第 \${i} 段\`}</p>
          ))}
        </div>
        <XhBackTopRoot
          target={smoothEl}
          behavior="smooth"
          size="sm"
          style={rootStyle}
        >
          <XhBackTopTrigger />
        </XhBackTopRoot>
      </div>

      <div style={{ position: "relative" }}>
        <div ref={setAutoEl} style={boxStyle}>
          {Array.from({ length: 16 }, (_, i) => i + 1).map(i => (
            <p key={i} style={{ margin: "0 0 12px" }}>{\`auto · 第 \${i} 段\`}</p>
          ))}
        </div>
        <XhBackTopRoot
          target={autoEl}
          behavior="auto"
          size="sm"
          style={rootStyle}
        >
          <XhBackTopTrigger />
        </XhBackTopRoot>
      </div>
    </div>
  );
}
`;export{o as default};
