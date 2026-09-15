// 禁用 | 禁止调整尺寸
import type { CSSProperties, ReactNode } from "react";
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/react";

const EDGES = ["e", "s", "se"] as const;

export default function Demo(): ReactNode {
  return (
    <XhResizableRoot
      disabled
      defaultDimensions={{ width: 240, height: 120 }}
      aria-label="已锁定尺寸的占位区块"
      style={{
        borderRadius: "var(--xh-shape-surface)",
        background: "var(--xh-bg-subtle)",
        padding: "16px",
      }}
    >
      <span data-demo-block data-tone="neutral" style={{ "--xh-demo-block-block-size": "100%", "--xh-demo-block-min-block-size": "100%" } as CSSProperties} />
      {EDGES.map(edge => (
        <XhResizableHandle key={edge} edge={edge} />
      ))}
    </XhResizableRoot>
  );
}
