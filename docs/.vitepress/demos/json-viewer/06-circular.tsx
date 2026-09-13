/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 循环引用 | 值出现在自己的祖先链上就停下并标成 [Circular]，不会无限递归；共享引用不算环，照样摊开
import type { ReactNode } from "react";
import { XhJsonViewerRoot } from "@xihan-ui/react";

const shared = { id: 1 };
const node: Record<string, unknown> = { name: "root", left: shared, right: shared };
// 指回自己：摊到这里就停
node.parent = node;

export default function Demo(): ReactNode {
  return (
    <XhJsonViewerRoot
      value={node}
      defaultExpandedDepth={2}
      style={{ inlineSize: "100%", maxInlineSize: "420px" }}
    />
  );
}
