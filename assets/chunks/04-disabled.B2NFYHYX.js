const e=`// 禁用 | 把手全部退出 Tab 序列，按下也不进调整
import type { ReactNode } from "react";
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/react";

const EDGES = ["e", "s", "se"] as const;

export default function Demo(): ReactNode {
  return (
    <XhResizableRoot
      disabled
      defaultDimensions={{ width: 240, height: 120 }}
      style={{
        border: "1px solid var(--xh-border-default)",
        borderRadius: "var(--xh-shape-surface)",
        padding: "12px",
      }}
    >
      <span>尺寸锁定</span>
      {EDGES.map(edge => (
        <XhResizableHandle key={edge} edge={edge} />
      ))}
    </XhResizableRoot>
  );
}
`;export{e as default};
