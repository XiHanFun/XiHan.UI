// 基础用法 | 八条边各一个把手；拖动改尺寸，Tab 到把手用方向键也能推
import type { ReactNode } from "react";
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/react";
import { useState } from "react";

const EDGES = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;

export default function Demo(): ReactNode {
  const [dimensions, setDimensions] = useState({ width: 260, height: 140 });

  return (
    <>
      {/* 留出余量：把手压在边上，往外挪了半个身位 */}
      <div style={{ padding: "12px" }}>
        <XhResizableRoot
          dimensions={dimensions}
          onDimensionsChange={details => setDimensions(details.dimensions)}
          minWidth={120}
          minHeight={80}
          maxWidth={480}
          style={{
            border: "1px solid var(--xh-border-default)",
            borderRadius: "var(--xh-shape-surface)",
            padding: "12px",
          }}
        >
          <span>拖任意一条边或一个角</span>
          {EDGES.map(edge => (
            <XhResizableHandle key={edge} edge={edge} />
          ))}
        </XhResizableRoot>
      </div>
      <p style={{ marginTop: "12px", color: "var(--xh-fg-muted)" }}>
        {`${Math.round(dimensions.width)} × ${Math.round(dimensions.height)}`}
      </p>
    </>
  );
}
