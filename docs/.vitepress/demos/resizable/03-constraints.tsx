/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 约束 | 设置宽高比和步进
import type { ReactNode } from "react";
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/react";
import { useState } from "react";

const EDGES = ["e", "s", "se"] as const;

export default function Demo(): ReactNode {
  const [ratio, setRatio] = useState({ width: 240, height: 135 });
  const [snapped, setSnapped] = useState({ width: 240, height: 120 });

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <p style={{ marginBottom: "8px" }}>16:9 宽高比</p>
        <XhResizableRoot
          dimensions={ratio}
          onDimensionsChange={details => setRatio(details.dimensions)}
          aspectRatio={16 / 9}
          edges={[...EDGES]}
          minWidth={160}
          style={{
            borderRadius: "var(--xh-shape-surface)",
            background: "var(--xh-bg-subtle)",
            padding: "16px",
          }}
        >
          <span>{`${Math.round(ratio.width)} × ${Math.round(ratio.height)}`}</span>
          {EDGES.map(edge => (
            <XhResizableHandle key={edge} edge={edge} />
          ))}
        </XhResizableRoot>
      </div>

      <div>
        <p style={{ marginBottom: "8px" }}>40px 步进</p>
        <XhResizableRoot
          dimensions={snapped}
          onDimensionsChange={details => setSnapped(details.dimensions)}
          step={40}
          edges={[...EDGES]}
          minWidth={120}
          minHeight={80}
          style={{
            borderRadius: "var(--xh-shape-surface)",
            background: "var(--xh-bg-subtle)",
            padding: "16px",
          }}
        >
          <span>{`${snapped.width} × ${snapped.height}`}</span>
          {EDGES.map(edge => (
            <XhResizableHandle key={edge} edge={edge} />
          ))}
        </XhResizableRoot>
      </div>
    </div>
  );
}
