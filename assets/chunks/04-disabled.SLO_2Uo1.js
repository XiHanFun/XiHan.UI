const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 禁用 | 禁止调整尺寸
import type { ReactNode } from "react";
import { XhResizableHandle, XhResizableRoot } from "@xihan-ui/react";

const EDGES = ["e", "s", "se"] as const;

export default function Demo(): ReactNode {
  return (
    <XhResizableRoot
      disabled
      defaultDimensions={{ width: 240, height: 120 }}
      style={{
        borderRadius: "var(--xh-shape-surface)",
        background: "var(--xh-bg-subtle)",
        padding: "16px",
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
