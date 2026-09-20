const e=`// 基础用法 | 从右侧、底部或右下角调整尺寸
import type { CSSProperties, ReactNode } from "react";
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/react";
import { useState } from "react";

const EDGES = ["e", "s", "se"] as const;

export default function Demo(): ReactNode {
  const [dimensions, setDimensions] = useState({ width: 260, height: 140 });

  return (
    <div style={{ padding: "12px" }}>
      <XhResizableRoot
        dimensions={dimensions}
        onDimensionsChange={details => setDimensions(details.dimensions)}
        minWidth={120}
        minHeight={80}
        maxWidth={480}
        aria-label="可调整尺寸的占位区块"
        style={{
          borderRadius: "var(--xh-shape-surface)",
          background: "var(--xh-bg-subtle)",
          padding: "16px",
        }}
      >
        <span data-demo-block data-tone="warning" style={{ "--xh-demo-block-block-size": "100%", "--xh-demo-block-min-block-size": "100%" } as CSSProperties} />
        {EDGES.map(edge => (
          <XhResizableHandle key={edge} edge={edge} />
        ))}
      </XhResizableRoot>
    </div>
  );
}
`;export{e as default};
