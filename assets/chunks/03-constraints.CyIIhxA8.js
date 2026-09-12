const e=`// 约束 | 上下限夹住范围，aspectRatio 锁宽高比，step 吸附到整数倍
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
        <p style={{ marginBottom: "8px" }}>锁 16:9——推一条边，另一轴跟着算</p>
        <XhResizableRoot
          dimensions={ratio}
          onDimensionsChange={details => setRatio(details.dimensions)}
          aspectRatio={16 / 9}
          edges={[...EDGES]}
          minWidth={160}
          style={{
            border: "1px solid var(--xh-border-default)",
            borderRadius: "var(--xh-shape-surface)",
            padding: "12px",
          }}
        >
          <span>{\`\${Math.round(ratio.width)} × \${Math.round(ratio.height)}\`}</span>
          {EDGES.map(edge => (
            <XhResizableHandle key={edge} edge={edge} />
          ))}
        </XhResizableRoot>
      </div>

      <div>
        <p style={{ marginBottom: "8px" }}>吸附到 40 的整数倍</p>
        <XhResizableRoot
          dimensions={snapped}
          onDimensionsChange={details => setSnapped(details.dimensions)}
          step={40}
          edges={[...EDGES]}
          minWidth={120}
          minHeight={80}
          style={{
            border: "1px solid var(--xh-border-default)",
            borderRadius: "var(--xh-shape-surface)",
            padding: "12px",
          }}
        >
          <span>{\`\${snapped.width} × \${snapped.height}\`}</span>
          {EDGES.map(edge => (
            <XhResizableHandle key={edge} edge={edge} />
          ))}
        </XhResizableRoot>
      </div>
    </div>
  );
}
`;export{e as default};
