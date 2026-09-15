const n=`// 全部边缘 | 从任意边缘或角点调整尺寸
import type { ReactNode } from "react";
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/react";
import { useState } from "react";

const EDGES = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;

export default function Demo(): ReactNode {
  const [dimensions, setDimensions] = useState({ width: 240, height: 120 });

  return (
    <XhResizableRoot
      dimensions={dimensions}
      onDimensionsChange={details => setDimensions(details.dimensions)}
      edges={[...EDGES]}
      minWidth={120}
      minHeight={80}
      style={{
        borderRadius: "var(--xh-shape-surface)",
        background: "var(--xh-bg-subtle)",
        padding: "16px",
      }}
    >
      <span>从任意边缘调整</span>
      {EDGES.map(edge => (
        <XhResizableHandle key={edge} edge={edge} />
      ))}
    </XhResizableRoot>
  );
}
`;export{n as default};
