// 基础用法 | 从右侧、底部或右下角调整尺寸
import type { ReactNode } from "react";
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
        style={{
          borderRadius: "var(--xh-shape-surface)",
          background: "var(--xh-bg-subtle)",
          padding: "16px",
        }}
      >
        <strong>预览区域</strong>
        <p style={{ color: "var(--xh-fg-muted)" }}>拖动边缘调整画布大小。</p>
        {EDGES.map(edge => (
          <XhResizableHandle key={edge} edge={edge} />
        ))}
      </XhResizableRoot>
    </div>
  );
}
