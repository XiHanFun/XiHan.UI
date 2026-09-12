const e=`// 只开放部分边 | edges 决定哪几条边可调；没开放的边不显示把手
import type { ReactNode } from "react";
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/react";
import { useState } from "react";

// 只往右下角撑大——文档流里最常见的形态，不需要定位上下文也完全正确
const EDGES = ["e", "s", "se"] as const;

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
        border: "1px solid var(--xh-border-default)",
        borderRadius: "var(--xh-shape-surface)",
        padding: "12px",
      }}
    >
      <span>只有右、下、右下三个把手</span>
      {EDGES.map(edge => (
        <XhResizableHandle key={edge} edge={edge} />
      ))}
    </XhResizableRoot>
  );
}
`;export{e as default};
