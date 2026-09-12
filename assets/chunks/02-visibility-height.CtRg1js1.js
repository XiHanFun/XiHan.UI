const e=`// 露面阈值 | visibility-height 决定滚过多少像素按钮才出现
import type { CSSProperties, ReactNode } from "react";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/react";
import { useState } from "react";

const boxStyle: CSSProperties = {
  blockSize: "240px",
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
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [threshold, setThreshold] = useState(80);

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        滚过
        <input
          value={threshold}
          onChange={event => setThreshold(Number(event.target.value))}
          type="range"
          min="0"
          max="600"
          step="20"
        />
        {\`\${threshold}px 才露面\`}
      </label>

      <div style={{ position: "relative" }}>
        <div ref={setScrollEl} style={boxStyle}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map(i => (
            <p key={i} style={{ margin: "0 0 12px" }}>{\`第 \${i} 段内容。\`}</p>
          ))}
        </div>

        <XhBackTopRoot
          target={scrollEl}
          visibilityHeight={threshold}
          style={rootStyle}
        >
          <XhBackTopTrigger />
        </XhBackTopRoot>
      </div>
    </div>
  );
}
`;export{e as default};
